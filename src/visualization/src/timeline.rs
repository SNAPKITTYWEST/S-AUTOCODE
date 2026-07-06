use crate::visualization::Theme;
use autocode_emulator::subleq::machine::SubleqStep;

pub struct ExecutionTimeline {
    steps: Vec<SubleqStep>,
    theme: Theme,
    scale: f64,
}

impl ExecutionTimeline {
    pub fn new(steps: Vec<SubleqStep>, theme: Theme, scale: f64) -> Self {
        Self { steps, theme, scale }
    }

    pub fn to_ascii(&self) -> String {
        let mut art = String::new();
        art.push_str("Execution Timeline\n");
        art.push_str("==================\n\n");
        for (i, step) in self.steps.iter().enumerate() {
            let bar_len = ((step.c as f64 - step.pc as f64).abs() * self.scale) as usize;
            let bar = match self.theme {
                Theme::PhosphorGreen => "█".repeat(bar_len.min(80)),
                Theme::CrtAmber => "▓".repeat(bar_len.min(80)),
                Theme::MatrixGreen => "0".repeat(bar_len.min(80)),
            };
            art.push_str(&format!("  {:4} | PC:{:4} | {}{}\n",
                i, step.pc, bar,
                if step.branch_taken { " ←" } else { "" }));
        }
        art
    }

    pub fn to_svg(&self) -> String {
        let width = self.steps.len().min(1000);
        let mut svg = format!(r#"<svg xmlns="http://www.w3.org/2000/svg" width="{}" height="200">"#, width * 2);
        svg.push_str(r#"<rect width="100%" height="100%" fill="#0a0a0a"/>"#);
        for (i, step) in self.steps.iter().take(width).enumerate() {
            let h = ((step.c as f64 - step.pc as f64).abs() * self.scale).min(180.0) as f64;
            let color = if step.branch_taken { "#ff0000" } else { "#00ff41" };
            svg.push_str(&format!(
                r#"<rect x="{}" y="{}" width="1" height="{}" fill="{}"/>"#,
                i * 2, 190 - h as usize, h, color
            ));
        }
        svg.push_str("</svg>");
        svg
    }

    pub fn summary(&self) -> String {
        let total = self.steps.len();
        let branches = self.steps.iter().filter(|s| s.branch_taken).count();
        format!("Total steps: {}, Branches taken: {} ({:.1}%)",
            total, branches, 100.0 * branches as f64 / total.max(1) as f64)
    }
}
