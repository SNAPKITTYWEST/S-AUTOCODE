use wasm_bindgen::prelude::*;
use autocode_compiler::SubleqBackend;
use autocode_emulator::{SubleqMachine, analyze_self_modification, SelfModificationReport};

#[wasm_bindgen]
#[derive(Debug, Clone, serde::Serialize)]
pub struct StepResult {
    pub step: usize,
    pub pc: usize,
    pub a: usize,
    pub b: usize,
    pub c: usize,
    pub mem_a_before: i64,
    pub mem_b_before: i64,
    pub mem_b_after: i64,
    pub branch_taken: bool,
}

#[wasm_bindgen]
pub struct MachineState {
    memory: Vec<i64>,
    pub pc: usize,
    pub halted: bool,
    pub step_count: usize,
    trace: Vec<StepResult>,
    self_mod: Option<SelfModificationReport>,
}

#[wasm_bindgen]
impl MachineState {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            memory: vec![0; 1024],
            pc: 0,
            halted: false,
            step_count: 0,
            trace: Vec::new(),
            self_mod: None,
        }
    }

    pub fn memory_len(&self) -> usize {
        self.memory.len()
    }

    pub fn get_memory_cell(&self, addr: usize) -> i64 {
        if addr < self.memory.len() { self.memory[addr] } else { 0 }
    }

    pub fn set_memory_cell(&mut self, addr: usize, val: i64) {
        if addr < self.memory.len() {
            self.memory[addr] = val;
        }
    }

    pub fn trace_len(&self) -> usize {
        self.trace.len()
    }

    pub fn get_trace_step(&self, idx: usize) -> StepResult {
        if idx < self.trace.len() {
            self.trace[idx].clone()
        } else {
            StepResult {
                step: 0, pc: 0, a: 0, b: 0, c: 0,
                mem_a_before: 0, mem_b_before: 0, mem_b_after: 0,
                branch_taken: false,
            }
        }
    }

    pub fn memory_json(&self) -> String {
        let non_zero: Vec<(usize, i64)> = self.memory.iter().enumerate()
            .filter(|(_, &v)| v != 0)
            .map(|(i, &v)| (i, v))
            .collect();
        serde_json::to_string(&non_zero).unwrap_or_default()
    }

    pub fn trace_json(&self) -> String {
        serde_json::to_string(&self.trace).unwrap_or_default()
    }

    pub fn self_mod_json(&self) -> String {
        match &self.self_mod {
            Some(r) => serde_json::to_string(r).unwrap_or_default(),
            None => "{}".to_string(),
        }
    }
}

#[wasm_bindgen]
pub fn compile_source(source: &str) -> String {
    let mut backend = SubleqBackend::new(
        autocode_compiler::SymbolTable::new(0, 1024)
    );
    let instrs = backend.translate_from_source(source);
    serde_json::to_string(&instrs).unwrap_or_else(|_| "[]".to_string())
}

#[wasm_bindgen]
pub fn compile_and_run(source: &str) -> MachineState {
    let mut state = MachineState::new();

    let mut backend = SubleqBackend::new(
        autocode_compiler::SymbolTable::new(0, 1024)
    );
    let instrs = backend.translate_from_source(source);

    let needed = instrs.len() * 3;
    if state.memory.len() < needed {
        state.memory.resize(needed.max(1024), 0);
    }

    let mut machine = SubleqMachine::new(state.memory.len());
    machine.load_program(&instrs);

    let _ = machine.run();

    state.memory = machine.mem.clone();
    state.pc = machine.pc;
    state.halted = machine.halted;
    state.step_count = machine.trace.len();

    for event in &machine.trace {
        state.trace.push(StepResult {
            step: event.step,
            pc: event.pc,
            a: event.a,
            b: event.b,
            c: event.c,
            mem_a_before: event.mem_a_before,
            mem_b_before: event.mem_b_before,
            mem_b_after: event.mem_b_after,
            branch_taken: event.branch_taken,
        });
    }

    let report = analyze_self_modification(&machine);
    state.self_mod = Some(report);

    state
}

#[wasm_bindgen]
pub fn run_step_by_step(source: &str, max_steps: usize) -> MachineState {
    let mut state = MachineState::new();

    let mut backend = SubleqBackend::new(
        autocode_compiler::SymbolTable::new(0, 1024)
    );
    let instrs = backend.translate_from_source(source);

    let needed = instrs.len() * 3;
    if state.memory.len() < needed {
        state.memory.resize(needed.max(1024), 0);
    }

    let mut machine = SubleqMachine::new(state.memory.len());
    machine.load_program(&instrs);

    for _ in 0..max_steps {
        if machine.halted { break; }
        if machine.step().is_err() { break; }
    }

    state.memory = machine.mem.clone();
    state.pc = machine.pc;
    state.halted = machine.halted;
    state.step_count = machine.trace.len();

    for event in &machine.trace {
        state.trace.push(StepResult {
            step: event.step,
            pc: event.pc,
            a: event.a,
            b: event.b,
            c: event.c,
            mem_a_before: event.mem_a_before,
            mem_b_before: event.mem_b_before,
            mem_b_after: event.mem_b_after,
            branch_taken: event.branch_taken,
        });
    }

    let report = analyze_self_modification(&machine);
    state.self_mod = Some(report);

    state
}

#[wasm_bindgen]
pub fn parse_single_line(line: &str) -> String {
    let line = line.trim();
    if line.is_empty() || line.starts_with('#') {
        return "null".to_string();
    }
    let parts: Vec<&str> = line.split_whitespace().collect();
    if parts.len() < 3 {
        return "null".to_string();
    }
    let sign = parts[0].chars().next().unwrap_or(' ');
    let addr: usize = parts[0][1..].parse().unwrap_or(0);
    let value: i32 = parts[1].parse().unwrap_or(0);
    let next: usize = parts[2].parse().unwrap_or(0);

    serde_json::to_string(&serde_json::json!({
        "sign": sign.to_string(),
        "addr": addr,
        "value": value,
        "next": next,
        "instr": { "a": addr, "b": addr + 1, "c": next }
    })).unwrap_or_default()
}

#[wasm_bindgen]
pub fn self_mod_analysis(source: &str) -> String {
    let mut backend = SubleqBackend::new(
        autocode_compiler::SymbolTable::new(0, 1024)
    );
    let instrs = backend.translate_from_source(source);

    let mut machine = SubleqMachine::new(1024);
    machine.load_program(&instrs);
    let _ = machine.run();

    let report = analyze_self_modification(&machine);
    serde_json::to_string(&report).unwrap_or_default()
}
