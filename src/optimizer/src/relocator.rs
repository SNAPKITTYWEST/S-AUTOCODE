use crate::optimizer::branch_analyzer::BranchProfile;
use crate::optimizer::drum_model::{DrumGeometry, PhysicalAddress, DrumLatencyCalculator, MemoryLayout};
use autocode_emulator::subleq::machine::SubleqInstr;
use std::collections::HashMap;
use petgraph::graph::{Graph, NodeIndex};

#[derive(Debug, Clone)]
pub struct RelocationPlan {
    pub original_layout: MemoryLayout,
    pub optimized_layout: MemoryLayout,
    pub block_order: Vec<usize>,
    pub estimated_latency_reduction: f64,
    pub relocation_map: HashMap<usize, usize>,
}

pub struct HeuristicRelocator {
    geometry: DrumGeometry,
    profile: BranchProfile,
    instructions: Vec<SubleqInstr>,
}

impl HeuristicRelocator {
    pub fn new(geometry: DrumGeometry, profile: BranchProfile, instructions: Vec<SubleqInstr>) -> Self {
        Self { geometry, profile, instructions }
    }

    pub fn optimize(&mut self) -> RelocationPlan {
        let cfg = self.build_weighted_cfg();
        let block_order = self.compute_optimal_block_order(&cfg);
        let optimized_layout = self.assign_addresses(&block_order);
        let relocation_map = self.build_relocation_map(&optimized_layout);
        let original_layout = self.build_original_layout();
        let estimated_reduction = self.estimate_latency_improvement(&original_layout, &optimized_layout);

        RelocationPlan {
            original_layout,
            optimized_layout,
            block_order,
            estimated_latency_reduction: estimated_reduction,
            relocation_map,
        }
    }

    fn build_weighted_cfg(&self) -> Graph<(), f64> {
        let mut graph = Graph::new();
        let mut block_nodes = HashMap::new();
        for block in &self.profile.basic_blocks {
            let node = graph.add_node(());
            block_nodes.insert(block.start_pc, node);
        }
        for block in &self.profile.basic_blocks {
            if let Some(&from_node) = block_nodes.get(&block.start_pc) {
                for edge in &block.exit_edges {
                    for target in &self.profile.basic_blocks {
                        if target.instructions.contains(&edge.to_pc) {
                            if let Some(&to_node) = block_nodes.get(&target.start_pc) {
                                graph.add_edge(from_node, to_node, edge.probability * block.entry_count as f64);
                            }
                            break;
                        }
                    }
                }
            }
        }
        graph
    }

    fn compute_optimal_block_order(&self, _cfg: &Graph<(), f64>) -> Vec<usize> {
        let mut scores: Vec<(usize, f64)> = self.profile.basic_blocks.iter()
            .enumerate()
            .map(|(i, b)| {
                let mut score = b.entry_count as f64;
                if self.profile.loop_headers.contains(&b.start_pc) { score *= 2.0; }
                (i, score)
            })
            .collect();
        scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        scores.into_iter().map(|(i, _)| i).collect()
    }

    fn assign_addresses(&self, block_order: &[usize]) -> MemoryLayout {
        let mut layout = MemoryLayout {
            instruction_to_address: HashMap::new(),
            address_to_instruction: HashMap::new(),
            total_sectors_used: 0,
        };
        let mut current_addr = PhysicalAddress { track: 0, sector: 0, word_offset: 0 };
        for &block_idx in block_order {
            let block = &self.profile.basic_blocks[block_idx];
            if current_addr.word_offset != 0 {
                current_addr = self.next_sector(current_addr);
            }
            for &pc in &block.instructions {
                layout.instruction_to_address.insert(pc, current_addr);
                layout.address_to_instruction.insert(current_addr, pc);
                current_addr = self.next_instruction(current_addr);
            }
        }
        layout.total_sectors_used = current_addr.track * self.geometry.sectors_per_track + current_addr.sector + 1;
        layout
    }

    fn next_instruction(&self, addr: PhysicalAddress) -> PhysicalAddress {
        let mut next = addr;
        next.word_offset += 3;
        if next.word_offset >= self.geometry.words_per_sector { next = self.next_sector(next); }
        next
    }

    fn next_sector(&self, addr: PhysicalAddress) -> PhysicalAddress {
        let mut next = addr;
        next.word_offset = 0;
        next.sector += 1;
        if next.sector >= self.geometry.sectors_per_track { next.sector = 0; next.track += 1; }
        next
    }

    fn build_relocation_map(&self, layout: &MemoryLayout) -> HashMap<usize, usize> {
        let mut map = HashMap::new();
        for (old_pc, phys_addr) in &layout.instruction_to_address {
            let new_pc = phys_addr.linear_index(&self.geometry) / 3;
            map.insert(*old_pc, new_pc);
        }
        map
    }

    fn build_original_layout(&self) -> MemoryLayout {
        let mut layout = MemoryLayout {
            instruction_to_address: HashMap::new(),
            address_to_instruction: HashMap::new(),
            total_sectors_used: 0,
        };
        let mut current_addr = PhysicalAddress { track: 0, sector: 0, word_offset: 0 };
        for pc in 0..self.instructions.len() {
            layout.instruction_to_address.insert(pc, current_addr);
            layout.address_to_instruction.insert(current_addr, pc);
            current_addr = self.next_instruction(current_addr);
        }
        layout.total_sectors_used = current_addr.track * self.geometry.sectors_per_track + current_addr.sector + 1;
        layout
    }

    fn estimate_latency_improvement(&self, original: &MemoryLayout, optimized: &MemoryLayout) -> f64 {
        let trace_orig = self.trace_memory_accesses(original);
        let trace_opt = self.trace_memory_accesses(optimized);
        let mut calc_orig = DrumLatencyCalculator::new(self.geometry);
        let mut calc_opt = DrumLatencyCalculator::new(self.geometry);
        let lat_orig: u64 = calc_orig.simulate_sequence(&trace_orig).iter().sum();
        let lat_opt: u64 = calc_opt.simulate_sequence(&trace_opt).iter().sum();
        if lat_orig == 0 { return 0.0; }
        1.0 - (lat_opt as f64 / lat_orig as f64)
    }

    fn trace_memory_accesses(&self, layout: &MemoryLayout) -> Vec<PhysicalAddress> {
        let mut accesses = Vec::new();
        for block in &self.profile.basic_blocks {
            for _ in 0..block.entry_count.min(1000) {
                for &pc in &block.instructions {
                    if let Some(&addr) = layout.instruction_to_address.get(&pc) {
                        accesses.push(addr);
                    }
                }
            }
        }
        accesses
    }
}
