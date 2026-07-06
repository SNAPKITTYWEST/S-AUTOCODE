use std::collections::{HashMap, HashSet};
use serde::{Serialize, Deserialize};
use autocode_emulator::subleq::machine::SubleqStep;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BranchProfile {
    pub instruction_frequencies: HashMap<usize, u64>,
    pub branch_taken_counts: HashMap<usize, u64>,
    pub branch_not_taken_counts: HashMap<usize, u64>,
    pub edge_frequencies: HashMap<(usize, usize), u64>,
    pub basic_blocks: Vec<BasicBlock>,
    pub loop_headers: HashSet<usize>,
    pub total_instructions_executed: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BasicBlock {
    pub start_pc: usize,
    pub end_pc: usize,
    pub instructions: Vec<usize>,
    pub entry_count: u64,
    pub exit_edges: Vec<BlockEdge>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockEdge {
    pub from_pc: usize,
    pub to_pc: usize,
    pub taken_count: u64,
    pub not_taken_count: u64,
    pub probability: f64,
}

pub struct BranchAnalyzer {
    trace: Vec<RecordedStep>,
}

#[derive(Debug, Clone)]
struct RecordedStep {
    pc: usize,
    a: usize,
    b: usize,
    c: usize,
    branch_taken: bool,
}

impl BranchAnalyzer {
    pub fn new(trace: &[SubleqStep]) -> Self {
        let recorded: Vec<_> = trace.iter().map(|s| RecordedStep {
            pc: s.pc,
            a: s.instr.a,
            b: s.instr.b,
            c: s.instr.c,
            branch_taken: s.branch_taken,
        }).collect();
        Self { trace: recorded }
    }

    pub fn analyze(&self) -> BranchProfile {
        let mut instruction_frequencies = HashMap::new();
        let mut branch_taken_counts = HashMap::new();
        let mut branch_not_taken_counts = HashMap::new();
        let mut edge_frequencies = HashMap::new();

        for step in &self.trace {
            *instruction_frequencies.entry(step.pc).or_insert(0) += 1;
            let next_pc = if step.branch_taken { step.c } else { step.pc + 1 };
            *edge_frequencies.entry((step.pc, next_pc)).or_insert(0) += 1;
            if step.branch_taken {
                *branch_taken_counts.entry(step.pc).or_insert(0) += 1;
            } else {
                *branch_not_taken_counts.entry(step.pc).or_insert(0) += 1;
            }
        }

        let basic_blocks = self.identify_basic_blocks(&instruction_frequencies, &edge_frequencies);
        let loop_headers = self.detect_loop_headers(&edge_frequencies);

        BranchProfile {
            instruction_frequencies,
            branch_taken_counts,
            branch_not_taken_counts,
            edge_frequencies,
            basic_blocks,
            loop_headers,
            total_instructions_executed: self.trace.len() as u64,
        }
    }

    fn identify_basic_blocks(
        &self,
        instr_freq: &HashMap<usize, u64>,
        edge_freq: &HashMap<(usize, usize), u64>,
    ) -> Vec<BasicBlock> {
        let mut blocks = Vec::new();
        let mut leaders = HashSet::new();
        leaders.insert(0);
        for (from, to) in edge_freq.keys() {
            leaders.insert(*to);
        }

        let mut sorted_leaders: Vec<_> = leaders.into_iter().collect();
        sorted_leaders.sort();

        let max_pc = instr_freq.keys().max().copied().unwrap_or(0);
        let mut visited = HashSet::new();

        for &leader in &sorted_leaders {
            if visited.contains(&leader) { continue; }
            let mut instructions = Vec::new();
            let mut pc = leader;
            while pc <= max_pc {
                if visited.contains(&pc) && pc != leader { break; }
                visited.insert(pc);
                instructions.push(pc);
                let is_branch = edge_freq.keys().any(|(f, _)| *f == pc && *f != pc + 1);
                pc += 1;
                if is_branch || sorted_leaders.contains(&pc) { break; }
            }
            let entry_count = *instr_freq.get(&leader).unwrap_or(&0);
            let exit_edges = self.compute_exit_edges(&instructions, edge_freq);
            blocks.push(BasicBlock {
                start_pc: leader,
                end_pc: *instructions.last().unwrap_or(&leader),
                instructions,
                entry_count,
                exit_edges,
            });
        }
        blocks
    }

    fn compute_exit_edges(
        &self,
        instructions: &[usize],
        edge_freq: &HashMap<(usize, usize), u64>,
    ) -> Vec<BlockEdge> {
        let last_pc = match instructions.last() {
            Some(&pc) => pc,
            None => return Vec::new(),
        };
        let mut edges = Vec::new();
        for ((from, to), &count) in edge_freq {
            if *from == last_pc {
                let taken = count;
                let not_taken = edge_freq.get(&(*from, *from + 1)).copied().unwrap_or(0);
                let total = taken + not_taken;
                let probability = if total > 0 { taken as f64 / total as f64 } else { 0.0 };
                edges.push(BlockEdge {
                    from_pc: *from, to_pc: *to,
                    taken_count: taken, not_taken_count: not_taken, probability,
                });
            }
        }
        edges
    }

    fn detect_loop_headers(&self, edge_freq: &HashMap<(usize, usize), u64>) -> HashSet<usize> {
        let mut headers = HashSet::new();
        for ((from, to), &count) in edge_freq {
            if to < from && count > 10 {
                headers.insert(*to);
            }
        }
        headers
    }
}
