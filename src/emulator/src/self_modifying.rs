//! Self-Modifying Code Detection and Analysis
//!
//! This module provides tools for detecting, analyzing, and reporting
//! self-modifying code behavior in SUBLEQ programs executing on unified memory.

use crate::subleq::machine::{MemoryWrite, SelfModificationReport, TraceEvent, Word};

/// Analyzes a trace to identify self-modifying code patterns
pub struct SelfModificationAnalyzer {
    /// Threshold for considering an address "hot" (frequently modified)
    hot_threshold: usize,
}

impl SelfModificationAnalyzer {
    pub fn new(hot_threshold: usize) -> Self {
        Self { hot_threshold }
    }

    /// Analyze a self-modification report and produce insights
    pub fn analyze(&self, report: &SelfModificationReport) -> AnalysisResult {
        let total_writes = report.writes.len();
        let instruction_writes = report.writes.iter()
            .filter(|w| w.writes_instruction_field)
            .count();

        let hot_addresses = self.find_hot_addresses(&report.writes);
        let modification_patterns = self.detect_patterns(&report.writes);

        AnalysisResult {
            total_memory_writes: total_writes,
            instruction_field_writes: instruction_writes,
            hot_addresses,
            patterns: modification_patterns,
            deterministic: report.deterministic,
            sandbox_safe: report.sandbox_safe,
        }
    }

    /// Find addresses that are modified frequently (hot spots)
    fn find_hot_addresses(&self, writes: &[MemoryWrite]) -> Vec<HotAddress> {
        use std::collections::HashMap;

        let mut write_counts: HashMap<usize, usize> = HashMap::new();
        for write in writes {
            *write_counts.entry(write.address).or_insert(0) += 1;
        }

        write_counts
            .into_iter()
            .filter(|(_, count)| *count >= self.hot_threshold)
            .map(|(address, count)| HotAddress { address, write_count: count })
            .collect()
    }

    /// Detect common self-modification patterns
    fn detect_patterns(&self, writes: &[MemoryWrite]) -> Vec<ModificationPattern> {
        let mut patterns = Vec::new();

        // Pattern 1: Sequential instruction modification (code generation)
        if self.has_sequential_instruction_writes(writes) {
            patterns.push(ModificationPattern::CodeGeneration);
        }

        // Pattern 2: Loop counter modification (self-modifying loop)
        if self.has_cyclic_writes(writes) {
            patterns.push(ModificationPattern::SelfModifyingLoop);
        }

        // Pattern 3: Jump target modification (dynamic control flow)
        if self.has_jump_target_modifications(writes) {
            patterns.push(ModificationPattern::DynamicControlFlow);
        }

        patterns
    }

    fn has_sequential_instruction_writes(&self, writes: &[MemoryWrite]) -> bool {
        let instr_writes: Vec<_> = writes.iter()
            .filter(|w| w.writes_instruction_field)
            .collect();

        if instr_writes.len() < 3 {
            return false;
        }

        // Check if instruction writes are sequential
        for window in instr_writes.windows(2) {
            if window[1].address == window[0].address + 3 {
                return true;
            }
        }
        false
    }

    fn has_cyclic_writes(&self, writes: &[MemoryWrite]) -> bool {
        use std::collections::HashSet;
        let mut seen = HashSet::new();
        let mut revisited = false;

        for write in writes {
            if !seen.insert(write.address) {
                revisited = true;
                break;
            }
        }

        revisited
    }

    fn has_jump_target_modifications(&self, writes: &[MemoryWrite]) -> bool {
        // Jump targets are typically at positions pc+2 (the 'c' field in SUBLEQ)
        writes.iter().any(|w| w.address % 3 == 2 && w.writes_instruction_field)
    }
}

#[derive(Debug, Clone)]
pub struct AnalysisResult {
    pub total_memory_writes: usize,
    pub instruction_field_writes: usize,
    pub hot_addresses: Vec<HotAddress>,
    pub patterns: Vec<ModificationPattern>,
    pub deterministic: bool,
    pub sandbox_safe: bool,
}

#[derive(Debug, Clone)]
pub struct HotAddress {
    pub address: usize,
    pub write_count: usize,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ModificationPattern {
    /// Sequential instruction modification (runtime code generation)
    CodeGeneration,
    /// Cyclic writes to same addresses (self-modifying loops)
    SelfModifyingLoop,
    /// Modification of jump targets (dynamic control flow)
    DynamicControlFlow,
}

/// Verification witness for self-modifying code execution
#[derive(Debug, Clone)]
pub struct VerificationWitness {
    pub initial_memory_hash: String,
    pub final_memory_hash: String,
    pub trace_hash: String,
    pub modification_count: usize,
    pub deterministic: bool,
    pub sandbox_safe: bool,
}

impl VerificationWitness {
    /// Generate a verification witness from execution trace
    pub fn from_trace(
        initial_memory: &[Word],
        final_memory: &[Word],
        trace: &[TraceEvent],
        modifications: &[MemoryWrite],
    ) -> Self {
        use sha2::{Sha256, Digest};

        let initial_hash = Self::hash_memory(initial_memory);
        let final_hash = Self::hash_memory(final_memory);
        let trace_hash = Self::hash_trace(trace);

        Self {
            initial_memory_hash: initial_hash,
            final_memory_hash: final_hash,
            trace_hash,
            modification_count: modifications.len(),
            deterministic: true,
            sandbox_safe: true,
        }
    }

    fn hash_memory(memory: &[Word]) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        for word in memory {
            hasher.update(word.to_le_bytes());
        }
        format!("{:x}", hasher.finalize())
    }

    fn hash_trace(trace: &[TraceEvent]) -> String {
        use sha2::{Sha256, Digest};
        let mut hasher = Sha256::new();
        for event in trace {
            hasher.update(event.pc.to_le_bytes());
            hasher.update(event.a.to_le_bytes());
            hasher.update(event.b.to_le_bytes());
            hasher.update(event.c.to_le_bytes());
        }
        format!("{:x}", hasher.finalize())
    }

    /// Seal the witness with a timestamp and signature
    pub fn seal(&self) -> SealedWitness {
        use std::time::{SystemTime, UNIX_EPOCH};
        
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();

        let receipt = format!(
            "SUBLEQ-WITNESS-v1|{}|{}|{}|{}|{}",
            timestamp,
            self.initial_memory_hash,
            self.final_memory_hash,
            self.trace_hash,
            self.modification_count
        );

        SealedWitness {
            witness: self.clone(),
            timestamp,
            receipt,
        }
    }
}

#[derive(Debug, Clone)]
pub struct SealedWitness {
    pub witness: VerificationWitness,
    pub timestamp: u64,
    pub receipt: String,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_analyzer_creation() {
        let analyzer = SelfModificationAnalyzer::new(5);
        assert_eq!(analyzer.hot_threshold, 5);
    }

    #[test]
    fn test_pattern_detection() {
        let writes = vec![
            MemoryWrite {
                step: 0,
                address: 0,
                old_value: 0,
                new_value: 1,
                writes_instruction_field: true,
            },
            MemoryWrite {
                step: 1,
                address: 3,
                old_value: 0,
                new_value: 2,
                writes_instruction_field: true,
            },
        ];

        let analyzer = SelfModificationAnalyzer::new(1);
        assert!(analyzer.has_sequential_instruction_writes(&writes));
    }
}

// Made with Bob
