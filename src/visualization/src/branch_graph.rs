use crate::visualization::Theme;
use autocode_optimizer::branch_analyzer::BranchProfile;

pub struct BranchGraphView {
    profile: BranchProfile,
    theme: Theme,
    nodes: Vec<GraphNode>,
    edges: Vec<GraphEdge>,
}

#[derive(Debug, Clone)]
struct GraphNode {
    pub pc: usize,
    pub label: String,
    pub weight: u64,
    pub is_loop_header: bool,
}

#[derive(Debug, Clone)]
struct GraphEdge {
    pub from: usize,
    pub to: usize,
    pub weight: f64,
}

impl BranchGraphView {
    pub fn new(profile: BranchProfile, theme: Theme) -> Self {
        Self {
            profile,
            theme,
            nodes: Vec::new(),
            edges: Vec::new(),
        }
    }

    pub fn build(&mut self) {
        for block in &self.profile.basic_blocks {
            let is_loop_header = self.profile.loop_headers.contains(&block.start_pc);
            let label = format!("BB{}[{}]", block.start_pc, block.entry_count);
            self.nodes.push(GraphNode {
                pc: block.start_pc,
                label,
                weight: block.entry_count,
                is_loop_header,
            });
            for edge in &block.exit_edges {
                self.edges.push(GraphEdge {
                    from: edge.from_pc,
                    to: edge.to_pc,
                    weight: edge.probability,
                });
            }
        }
    }

    pub fn to_dot(&self) -> String {
        let mut dot = String::from("digraph AutocodeControlFlow {\n");
        dot.push_str("  rankdir=LR;\n");
        for node in &self.nodes {
            let shape = if node.is_loop_header { "hexagon" } else { "box" };
            let style = match self.theme {
                Theme::PhosphorGreen => "fillcolor=\"#0a0a0a\" fontcolor=\"#00ff41\" style=filled",
                Theme::CrtAmber => "fillcolor=\"#0a0a0a\" fontcolor=\"#ffb000\" style=filled",
                Theme::MatrixGreen => "fillcolor=\"#000000\" fontcolor=\"#00ff00\" style=filled",
            };
            dot.push_str(&format!("  \"{}\" [label=\"{}\" shape={} {}];\n",
                node.pc, node.label, shape, style));
        }
        for edge in &self.edges {
            let penwidth = (edge.weight * 5.0).max(0.5);
            dot.push_str(&format!("  \"{}\" -> \"{}\" [penwidth={:.1}];\n",
                edge.from, edge.to, penwidth));
        }
        dot.push_str("}\n");
        dot
    }

    pub fn to_ascii(&self) -> String {
        let mut art = String::new();
        art.push_str("Control Flow Graph\n");
        art.push_str("==================\n\n");
        for node in &self.nodes {
            let marker = if node.is_loop_header { "LOOP" } else { "    " };
            art.push_str(&format!("  {} [PC {:4}] weight: {}\n", marker, node.pc, node.weight));
        }
        art.push_str("\nEdges:\n");
        for edge in &self.edges {
            art.push_str(&format!("  {} -> {} (prob: {:.1})\n", edge.from, edge.to, edge.weight));
        }
        art
    }
}
