use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub struct Address(pub usize);

#[derive(Debug, Clone)]
pub struct SymbolTable {
    pub symbols: HashMap<String, Address>,
    pub next_address: usize,
    pub max_address: usize,
}

impl SymbolTable {
    pub fn new(start_address: usize, max_address: usize) -> Self {
        Self {
            symbols: HashMap::new(),
            next_address: start_address,
            max_address,
        }
    }

    pub fn register(&mut self, name: &str) -> Address {
        if let Some(&addr) = self.symbols.get(name) {
            addr
        } else {
            let addr = Address(self.next_address);
            self.next_address += 1;
            assert!(self.next_address <= self.max_address, "Memory exhausted");
            self.symbols.insert(name.to_string(), addr);
            addr
        }
    }

    pub fn resolve(&self, name: &str) -> Option<Address> {
        self.symbols.get(name).copied()
    }

    pub fn all_symbols(&self) -> Vec<(String, Address)> {
        let mut v: Vec<_> = self.symbols.iter()
            .map(|(k, v)| (k.clone(), *v))
            .collect();
        v.sort_by_key(|(_, addr)| addr.0);
        v
    }

    pub fn memory_size(&self) -> usize {
        self.next_address
    }
}
