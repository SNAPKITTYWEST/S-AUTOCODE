use crate::autocode::parser::Statement;

pub fn well_formed(stmt: &Statement) -> bool {
    !stmt.terms.is_empty() && !stmt.target.is_empty()
}
