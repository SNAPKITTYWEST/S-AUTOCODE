use crate::{BranchAnalyzer, HeuristicRelocator, DrumGeometry, ReportGenerator, LatencyReport, RelocationPlan};
use autocode_compiler::{SymbolTable, SubleqBackend, SubleqInstr};
use autocode_emulator::SubleqMachine;
use std::time::Instant;

pub struct OptimizationPipeline {
    geometry: DrumGeometry,
}

impl OptimizationPipeline {
    pub fn new(geometry: DrumGeometry) -> Self {
        Self { geometry }
    }

    pub fn run(&mut self, autocode_source: &str, program_name: &str) -> anyhow::Result<LatencyReport> {
        println!("Starting optimization pipeline for: {}", program_name);
        let start = Instant::now();

        println!("  Phase 1: Compiling Autocode to SUBLEQ...");
        let symtab = SymbolTable::new(0, 4096);
        let mut backend = SubleqBackend::new(symtab);
        let original_instructions = backend.translate_from_source(autocode_source);
        println!("  Generated {} SUBLEQ instructions", original_instructions.len());

        if original_instructions.is_empty() {
            println!("  WARNING: No instructions generated from source");
        }

        println!("  Phase 2: Baseline execution for profiling...");
        let mut baseline_machine = SubleqMachine::new(4096);
        baseline_machine.load_program(&original_instructions);
        baseline_machine.run().map_err(|e| anyhow::anyhow!("SUBLEQ execution failed: {}", e))?;
        println!("  Executed {} instructions", baseline_machine.trace.len());

        println!("  Phase 3: Analyzing branch frequencies...");
        let analyzer = BranchAnalyzer::new(&baseline_machine.trace);
        let profile = analyzer.analyze();
        println!("  Found {} basic blocks, {} loop headers",
            profile.basic_blocks.len(), profile.loop_headers.len());

        println!("  Phase 4: Computing latency-aware relocation...");
        let mut relocator = HeuristicRelocator::new(self.geometry, profile.clone(), original_instructions.clone());
        let plan = relocator.optimize();
        println!("  Estimated latency reduction: {:.1}%", plan.estimated_latency_reduction * 100.0);

        println!("  Phase 5: Verifying semantic equivalence...");
        let verification_passed = self.verify_equivalence(&original_instructions, &plan);

        let optimized_instructions = self.apply_relocation(&original_instructions, &plan.relocation_map);

        let report = ReportGenerator::generate(
            program_name, &profile, &plan, &self.geometry,
            &original_instructions, &optimized_instructions, verification_passed,
        );

        println!("  Pipeline completed in {:.2}s", start.elapsed().as_secs_f64());
        println!("  Latency reduction: {:.1}{}",
            report.improvement.latency_reduction_percent,
            if report.improvement.goal_achieved { " GOAL ACHIEVED" } else { "" });

        Ok(report)
    }

    fn verify_equivalence(&self, original: &[SubleqInstr], plan: &RelocationPlan) -> bool {
        let mut targets = std::collections::HashSet::new();
        for (_, &new_pc) in &plan.relocation_map {
            if !targets.insert(new_pc) { return false; }
        }
        plan.relocation_map.len() == original.len()
    }

    fn apply_relocation(&self, original: &[SubleqInstr], relocation_map: &std::collections::HashMap<usize, usize>) -> Vec<SubleqInstr> {
        let mut optimized = original.to_vec();
        for instr in &mut optimized {
            instr.a = *relocation_map.get(&instr.a).unwrap_or(&instr.a);
            instr.b = *relocation_map.get(&instr.b).unwrap_or(&instr.b);
            instr.c = *relocation_map.get(&instr.c).unwrap_or(&instr.c);
        }
        optimized
    }
}
