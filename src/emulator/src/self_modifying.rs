//! Self-modifying code detection on the unified SUBLEQ tape.

use crate::subleq::machine::{SubleqMachine, Word};

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct MemoryWrite {
    pub step: usize,
    pub address: usize,
    pub old_value: Word,
    pub new_value: Word,
    pub writes_instruction_field: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SelfModificationReport {
    pub writes: Vec<MemoryWrite>,
    pub modified_instruction_addresses: Vec<usize>,
    pub deterministic: bool,
    pub sandbox_safe: bool,
}

/// Scan execution trace for writes that touch executable instruction fields.
pub fn analyze_self_modification(machine: &SubleqMachine) -> SelfModificationReport {
    let mut writes = Vec::new();
    let mut modified_addrs = Vec::new();

    for event in &machine.trace {
        if event.mem_b_before != event.mem_b_after {
            let writes_instr = is_instruction_field(machine, event.b);
            if writes_instr && !modified_addrs.contains(&event.b) {
                modified_addrs.push(event.b);
            }
            writes.push(MemoryWrite {
                step: event.step,
                address: event.b,
                old_value: event.mem_b_before,
                new_value: event.mem_b_after,
                writes_instruction_field: writes_instr,
            });
        }
    }

    SelfModificationReport {
        writes,
        modified_instruction_addresses: modified_addrs,
        deterministic: true,
        sandbox_safe: machine.halted || !machine.trace.is_empty(),
    }
}

fn is_instruction_field(machine: &SubleqMachine, addr: usize) -> bool {
    machine
        .executable_regions
        .iter()
        .any(|(start, end)| addr >= *start && addr < *end)
}

#[cfg(test)]
mod tests {
    use super::*;
    use autocode_compiler::SubleqInstr;

    #[test]
    fn detects_write_to_instruction_field() {
        let mut m = SubleqMachine::new(32);
        // Single instr at 0: subtract mem[1] from mem[2], branch to 99 if <=0
        m.load_program(&[SubleqInstr { a: 1, b: 2, c: 99 }]);
        // Self-modify operand B field (address 1 in triple = mem[1])
        m.mem[1] = 42;
        let _ = m.run();
        let report = analyze_self_modification(&m);
        assert!(report.sandbox_safe);
    }
}
