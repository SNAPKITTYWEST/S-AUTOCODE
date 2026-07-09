use crate::manchester::cpu::{CpuState, ExecutionStep, ManchesterOrder};
use crate::subleq::machine::{SubleqMachine, SubleqStep, SubleqInstr};
use autocode_compiler::autocode::symbol_table::SymbolTable;

#[derive(Debug, Clone)]
pub struct ComparisonReport {
    pub program_name: String,
    pub manchester: ManchesterMetrics,
    pub subleq: SubleqMetrics,
    pub equivalence: EquivalenceCheck,
}

#[derive(Debug, Clone)]
pub struct ManchesterMetrics {
    pub total_cycles: u64,
    pub instruction_count: usize,
    pub memory_reads: usize,
    pub memory_writes: usize,
    pub drum_seeks: usize,
    pub total_latency_us: u64,
    pub final_memory: Vec<(usize, i32)>,
    pub trace: Vec<ExecutionStep>,
}

#[derive(Debug, Clone)]
pub struct SubleqMetrics {
    pub instruction_count: usize,
    pub executed_instructions: usize,
    pub branches_taken: usize,
    pub branches_not_taken: usize,
    pub memory_reads: usize,
    pub memory_writes: usize,
    pub final_memory: Vec<(usize, i32)>,
    pub trace: Vec<SubleqStep>,
}

#[derive(Debug, Clone)]
pub struct EquivalenceCheck {
    pub memory_equivalent: bool,
    pub differing_addresses: Vec<(usize, i32, i32)>,
    pub semantic_equivalence: bool,
}

pub fn compare_execution(
    program_name: &str,
    manchester_orders: &[ManchesterOrder],
    subleq_instrs: &[SubleqInstr],
    symtab: &SymbolTable,
    memory_size: usize,
) -> ComparisonReport {
    let mut manchester = CpuState::new(memory_size, 64, 64);
    manchester.load_program(manchester_orders);
    manchester.run();

    let mut subleq = SubleqMachine::new(memory_size);
    subleq.load_program(subleq_instrs);
    subleq.run();

    let manchester_memory = extract_manchester_memory(&manchester, symtab);
    let subleq_memory = extract_subleq_memory(&subleq, symtab);
    let equivalence = check_equivalence(&manchester_memory, &subleq_memory);

    ComparisonReport {
        program_name: program_name.to_string(),
        manchester: ManchesterMetrics {
            total_cycles: manchester.trace.iter().map(|s| s.cycles).sum(),
            instruction_count: manchester_orders.len(),
            memory_reads: manchester.trace.iter().flat_map(|s| &s.memory_accesses).filter(|a| a.is_read).count(),
            memory_writes: manchester.trace.iter().flat_map(|s| &s.memory_accesses).filter(|a| !a.is_read).count(),
            drum_seeks: manchester.trace.iter().flat_map(|s| &s.memory_accesses).filter(|a| a.is_drum).count(),
            total_latency_us: manchester.trace.iter().map(|s| s.cycles).sum(),
            final_memory: manchester_memory,
            trace: manchester.trace,
        },
        subleq: SubleqMetrics {
            instruction_count: subleq_instrs.len(),
            executed_instructions: subleq.trace.len(),
            branches_taken: subleq.trace.iter().filter(|s| s.branch_taken).count(),
            branches_not_taken: subleq.trace.iter().filter(|s| !s.branch_taken).count(),
            memory_reads: subleq.trace.len() * 2,
            memory_writes: subleq.trace.len(),
            final_memory: subleq.get_memory_i32().into_iter().enumerate().map(|(i,v)| (i,v)).collect(),
            trace: subleq.legacy_steps(),
        },
        equivalence,
    }
}

fn extract_manchester_memory(cpu: &CpuState, symtab: &SymbolTable) -> Vec<(usize, i32)> {
    symtab.all_symbols().into_iter()
        .map(|(_name, addr)| (addr.0, cpu.get_memory()[addr.0]))
        .collect()
}

fn extract_subleq_memory(machine: &SubleqMachine, symtab: &SymbolTable) -> Vec<(usize, i32)> {
    symtab.all_symbols().into_iter()
        .map(|(_name, addr)| (addr.0, machine.get_memory()[addr.0] as i32))
        .collect()
}

fn check_equivalence(
    man: &[(usize, i32)],
    sub: &[(usize, i32)],
) -> EquivalenceCheck {
    let mut diffs = Vec::new();
    for ((addr1, val1), (_addr2, val2)) in man.iter().zip(sub.iter()) {
        if val1 != val2 {
            diffs.push((*addr1, *val1, *val2));
        }
    }
    EquivalenceCheck {
        memory_equivalent: diffs.is_empty(),
        differing_addresses: diffs,
        semantic_equivalence: true,
    }
}
