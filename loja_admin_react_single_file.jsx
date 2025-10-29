/*
  LojaAdmin - Single-file React app (App.jsx)
  - Propósito: site de venda de roupas e acessórios (m/f/kids) com painel de administrador
  - Persistência: localStorage (produtos, usuario admin, catálogo)
  - Funcionalidades:
      * Página pública: catálogo, filtro por categoria, busca, produto, carrinho
      * Painel admin (login com senha): adicionar/editar/remover produtos, gerenciar estoque, categorias
      * Upload de imagem local (convertida para base64)
      * Exemplo de checkout (simples placeholder)
  - Como usar:
      1) Crie um projeto Vite (React) ou Create React App.
         - Vite (recomendado):
           npm create vite@latest minha-loja -- --template react
           cd minha-loja
           npm install
      2) Instale e configure TailwindCSS (opcional mas recomendado). Se preferir, pode usar CSS próprio.
         https://tailwindcss.com/docs/guides/vite
      3) Substitua src/App.jsx pelo conteúdo deste ficheiro e adicione src/index.css com Tailwind base or simple styles.
      4) npm run dev (Vite) ou npm start (CRA)

  Observações:
   - Este exemplo é uma base para uma loja. Para produção, implemente backend (autenticação segura, pagamentos, armazenamento de imagens e banco de dados).
   - Senha admin padrão: "admin123" — altere-a no painel de configuração do admin.
*/

import React, { useEffect, useState } from 'react';

// --- Utilidades simples ---
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,8);

const STORAGE_KEYS = {
  PRODUCTS: 'loja_produtos_v1',
  CART: 'loja_carrinho_v1',
  ADMIN: 'loja_admin_v1',
};

// Carrega produtos iniciais (se não existir nada no localStorage)
const seedProducts = () => [
  {
    id: uid(),
    title: 'T-shirt básica unissex',
    description: 'Malha leve, disponível em várias cores. Corte regular.',
    price: 19.99,
    category: 'Adulto - Unissex',
    sizes: ['S','M','L','XL'],
    stock: 20,
    image: '',
  },
  {
    id: uid(),
    title: 'Vestido floral (feminino)',
    description: 'Vestido midi com estampado floral. 100% algodão.',
    price: 49.9,
    category: 'Feminino',
    sizes: ['S','M','L'],
    stock: 10,
    image: '',
  },
  {
    id: uid(),
    title: 'Casaco infantil',
    description: 'Casaco quentinho para crianças. Forro macio.',
    price: 34.5,
    category: 'Infantil',
    sizes: ['2','3','4','5'],
    stock: 15,
    image: '',
  }
];

// --- Main App ---
export default function App() {
  const [view, setView] = useState('store'); // 'store' | 'admin'
  const [products, setProducts] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) return JSON.parse(raw);
    const seeded = seedProducts();
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(seeded));
    return seeded;
  });

  const [cart, setCart] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.CART);
    return raw ? JSON.parse(raw) : [];
  });

  const [admin, setAdmin] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.ADMIN);
    if (raw) return JSON.parse(raw);
    const defaultAdmin = { logged: false, password: 'admin123' };
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(defaultAdmin));
    return defaultAdmin;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN, JSON.stringify(admin));
  }, [admin]);

  // Store actions
  const addToCart = (product, size, qty=1) => {
    if (product.stock < qty) { alert('Estoque insuficiente'); return; }
    setCart(prev => {
      const found = prev.find(i => i.productId === product.id && i.size === size);
      if (found) {
        return prev.map(i => i === found ? {...i, qty: i.qty + qty} : i);
      }
      return [...prev, { id: uid(), productId: product.id, size, qty }];
    });
  };

  const updateCartItem = (id, qty) => {
    setCart(prev => prev.map(i => i.id === id ? {...i, qty} : i));
  };
  const removeCartItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCart([]);

  // Admin actions
  const addProduct = (p) => setProducts(prev => [{...p, id: uid()}, ...prev]);
  const updateProduct = (id, patch) => setProducts(prev => prev.map(p => p.id === id ? {...p, ...patch} : p));
  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header
        cartCount={cart.reduce((s,i)=>s+i.qty,0)}
        onGoAdmin={() => setView(view === 'admin' ? 'store' : 'admin')}
        view={view}
      />
      <main className="max-w-6xl mx-auto p-4">
        {view === 'store' ? (
          <Store
            products={products}
            addToCart={addToCart}
            cart={cart}
            updateCartItem={updateCartItem}
            removeCartItem={removeCartItem}
            clearCart={clearCart}
            checkout={() => alert('Simulação de checkout — integre um gateway real para produção')}
          />
        ) : (
          <AdminArea
            admin={admin}
            setAdmin={setAdmin}
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
          />
        )}
      </main>

    </div>
  );
}

// --- Header ---
function Header({ cartCount, onGoAdmin, view }){
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">LojaSimples</h1>
          <span className="text-sm text-gray-500">Roupas & Acessórios — Masculino, Feminino, Infantil</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-3 py-2 border rounded hover:bg-gray-100"
            onClick={onGoAdmin}
          >{view === 'admin' ? 'Voltar à loja' : 'Painel Admin'}</button>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-9v9" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">{cartCount}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// --- Store UI ---
function Store({ products, addToCart, cart, updateCartItem, removeCartItem, clearCart, checkout }){
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['ALL', ...Array.from(new Set(products.map(p=>p.category)))]

  const filtered = products.filter(p => (
    (category === 'ALL' || p.category === category) &&
    (p.title.toLowerCase().includes(query.toLowerCase()) || p.description.toLowerCase().includes(query.toLowerCase()))
  ));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar produtos..." className="border p-2 rounded w-64" />
            <select value={category} onChange={e=>setCategory(e.target.value)} className="border p-2 rounded">
              {categories.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="text-sm text-gray-600">{filtered.length} produtos</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-white p-4 rounded shadow-sm flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                {p.image ? <img src={p.image} alt={p.title} className="w-full h-full object-cover"/> : <div className="text-xs text-gray-400">Sem imagem</div>}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{p.title}</h3>
                <div className="text-sm text-gray-500">{p.category} • {p.sizes.join('/')}</div>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{p.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="font-bold">€ {p.price.toFixed(2)}</div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded" onClick={()=>setSelectedProduct(p)}>Ver / Comprar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="bg-white p-4 rounded shadow-sm">
        <h4 className="font-semibold mb-2">Carrinho</h4>
        {cart.length === 0 ? (
          <div className="text-sm text-gray-500">Carrinho vazio</div>
        ) : (
          <div className="space-y-2">
            {cart.map(item => {
              const p = products.find(x=>x.id === item.productId);
              if (!p) return null;
              return (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm">{p.title} <span className="text-xs text-gray-500">({item.size})</span></div>
                    <div className="text-xs text-gray-400">€ {(p.price * item.qty).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} value={item.qty} onChange={e=>updateCartItem(item.id, Number(e.target.value))} className="w-14 border p-1 rounded text-sm" />
                    <button onClick={()=>removeCartItem(item.id)} className="text-red-600 text-sm">Remover</button>
                  </div>
                </div>
              );
            })}
            <div className="border-t pt-2 text-sm">
              <div className="flex justify-between"><span>Total</span><strong>€ {cart.reduce((s,i)=>{
                const p = products.find(x=>x.id === i.productId); return s + (p ? p.price * i.qty : 0);
              },0).toFixed(2)}</strong></div>
              <div className="flex gap-2 mt-2">
                <button onClick={checkout} className="flex-1 px-3 py-2 bg-green-600 text-white rounded">Finalizar</button>
                <button onClick={clearCart} className="px-3 py-2 border rounded">Limpar</button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={()=>setSelectedProduct(null)} onAdd={addToCart} />
      )}
    </div>
  );
}

function ProductModal({ product, onClose, onAdd }){
  const [size, setSize] = useState(product.sizes[0]||'');
  const [qty, setQty] = useState(1);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-100 rounded p-2 flex items-center justify-center">
          {product.image ? <img src={product.image} alt={product.title} className="w-full h-64 object-cover" /> : <div className="text-gray-400">Sem imagem</div>}
        </div>
        <div>
          <h3 className="text-xl font-semibold">{product.title}</h3>
          <div className="text-sm text-gray-500">{product.category}</div>
          <p className="mt-2 text-sm text-gray-600">{product.description}</p>
          <div className="mt-3 font-bold">€ {product.price.toFixed(2)}</div>

          <div className="mt-3">
            <label className="text-sm">Tamanho</label>
            <select value={size} onChange={e=>setSize(e.target.value)} className="block w-full border p-2 rounded mt-1">
              {product.sizes.map(s=> <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <input type="number" min={1} max={product.stock} value={qty} onChange={e=>setQty(Number(e.target.value))} className="w-20 border p-2 rounded" />
            <button onClick={()=>{ onAdd(product, size, qty); onClose(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Adicionar</button>
            <button onClick={onClose} className="px-3 py-2 border rounded">Fechar</button>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- Admin ---
function AdminArea({ admin, setAdmin, products, addProduct, updateProduct, deleteProduct }){
  const [isLogged, setIsLogged] = useState(admin.logged);
  const [tab, setTab] = useState('catalog'); // 'catalog' | 'new' | 'settings'

  useEffect(()=> setIsLogged(admin.logged), [admin.logged]);

  const doLogin = (pwd) => {
    if (pwd === admin.password) { setAdmin(prev=>({...prev, logged: true})); setIsLogged(true); }
    else alert('Senha incorreta');
  };
  const doLogout = () => { setAdmin(prev=>({...prev, logged: false})); setIsLogged(false); }

  if (!isLogged) return (
    <div className="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Painel de Administração</h2>
      <p className="text-sm text-gray-600 mb-4">Faça login com sua senha de administrador para editar o catálogo.</p>
      <AdminLogin onLogin={doLogin} />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Painel de Administração</h2>
        <div className="flex gap-2">
          <button onClick={doLogout} className="px-3 py-2 border rounded">Sair</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab('catalog')} className={`px-3 py-2 rounded ${tab==='catalog'?'bg-gray-100':''}`}>Catálogo</button>
        <button onClick={()=>setTab('new')} className={`px-3 py-2 rounded ${tab==='new'?'bg-gray-100':''}`}>Novo Produto</button>
        <button onClick={()=>setTab('settings')} className={`px-3 py-2 rounded ${tab==='settings'?'bg-gray-100':''}`}>Configurações</button>
      </div>

      {tab === 'catalog' && (
        <div className="space-y-3">
          {products.map(p => (
            <AdminProductCard key={p.id} product={p} onUpdate={updateProduct} onDelete={()=>{ if (confirm('Remover produto?')) deleteProduct(p.id); }} />
          ))}
        </div>
      )}

      {tab === 'new' && (
        <div>
          <h3 className="font-semibold mb-2">Adicionar novo produto</h3>
          <ProductForm onSave={(data)=>{ addProduct(data); alert('Produto adicionado'); }} />
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-xl">
          <h3 className="font-semibold">Configurações</h3>
          <p className="text-sm text-gray-600">Alterar senha de administrador</p>
          <ChangePassword admin={admin} setAdmin={setAdmin} />
        </div>
      )}

    </div>
  );
}

function AdminLogin({ onLogin }){
  const [pwd, setPwd] = useState('');
  return (
    <form onSubmit={e=>{ e.preventDefault(); onLogin(pwd); }} className="flex gap-2">
      <input type="password" value={pwd} onChange={e=>setPwd(e.target.value)} placeholder="Senha admin" className="border p-2 rounded" />
      <button className="px-3 py-2 bg-blue-600 text-white rounded">Entrar</button>
    </form>
  );
}

function AdminProductCard({ product, onUpdate, onDelete }){
  const [editing, setEditing] = useState(false);
  return (
    <div className="border p-3 rounded flex gap-3 items-center">
      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.image ? <img src={product.image} alt={product.title} className="w-full h-full object-cover" /> : <div className="text-xs text-gray-400">Sem imagem</div>}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{product.title}</div>
        <div className="text-sm text-gray-500">{product.category} • € {product.price.toFixed(2)}</div>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>setEditing(true)} className="px-3 py-1 border rounded">Editar</button>
        <button onClick={onDelete} className="px-3 py-1 border rounded text-red-600">Remover</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white p-4 rounded max-w-2xl w-full">
            <h4 className="font-semibold mb-2">Editar produto</h4>
            <ProductForm initial={product} onSave={(patch)=>{ onUpdate(product.id, patch); setEditing(false); }} onCancel={()=>setEditing(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }){
  const isEdit = Boolean(initial);
  const [title, setTitle] = useState(initial?.title || '');
  const [desc, setDesc] = useState(initial?.description || '');
  const [price, setPrice] = useState(initial?.price || 0);
  const [category, setCategory] = useState(initial?.category || 'Uncategorized');
  const [sizes, setSizes] = useState(initial?.sizes?.join(',') || 'M,L');
  const [stock, setStock] = useState(initial?.stock || 0);
  const [image, setImage] = useState(initial?.image || '');

  const handleImage = (file) => {
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const save = () => {
    const payload = { title, description: desc, price: Number(price), category, sizes: sizes.split(',').map(s=>s.trim()).filter(Boolean), stock: Number(stock), image };
    onSave(payload);
    if (!isEdit) { setTitle(''); setDesc(''); setPrice(0); setSizes('M,L'); setStock(0); setImage(''); }
  };

  return (
    <div className="space-y-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título" className="w-full border p-2 rounded" />
      <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Descrição" className="w-full border p-2 rounded" />
      <div className="grid grid-cols-3 gap-2">
        <input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Preço" className="border p-2 rounded" />
        <input value={category} onChange={e=>setCategory(e.target.value)} placeholder="Categoria" className="border p-2 rounded" />
        <input value={sizes} onChange={e=>setSizes(e.target.value)} placeholder="Tamanhos (vírgula)" className="border p-2 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={stock} onChange={e=>setStock(e.target.value)} placeholder="Stock" className="border p-2 rounded" />
        <input type="file" accept="image/*" onChange={e=>handleImage(e.target.files[0])} className="border p-2 rounded" />
      </div>
      <div className="flex gap-2">
        <button onClick={save} className="px-3 py-2 bg-green-600 text-white rounded">Salvar</button>
        {onCancel && <button onClick={onCancel} className="px-3 py-2 border rounded">Cancelar</button>}
      </div>
    </div>
  );
}

function ChangePassword({ admin, setAdmin }){
  const [oldP, setOldP] = useState('');
  const [newP, setNewP] = useState('');
  const change = () => {
    if (oldP !== admin.password) { alert('Senha atual incorreta'); return; }
    if (newP.length < 4) { alert('Senha muito curta'); return; }
    setAdmin(prev=>({...prev, password: newP}));
    alert('Senha alterada');
    setOldP(''); setNewP('');
  };
  return (
    <div className="space-y-2 mt-2">
      <input type="password" value={oldP} onChange={e=>setOldP(e.target.value)} placeholder="Senha atual" className="border p-2 rounded w-full" />
      <input type="password" value={newP} onChange={e=>setNewP(e.target.value)} placeholder="Nova senha" className="border p-2 rounded w-full" />
      <div className="flex gap-2">
        <button onClick={change} className="px-3 py-2 bg-blue-600 text-white rounded">Alterar</button>
      </div>
    </div>
  );
}
