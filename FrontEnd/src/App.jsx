import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  Boxes,
  Camera,
  Check,
  ClipboardList,
  ImagePlus,
  Pencil,
  RefreshCcw,
  Save,
  Search,
  ShoppingCart,
  Store,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X
} from 'lucide-react'

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  category: ''
}

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'user'
}

const DEFAULT_API_URL = 'https://mobileproject-production-5937.up.railway.app'
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_API_URL : '')
).replace(/\/$/, '')
const apiUrl = (path) => `${API_BASE_URL}${path}`

const money = new Intl.NumberFormat('en-PK', {
  style: 'currency',
  currency: 'PKR',
  maximumFractionDigits: 0
})

function App() {
  const [activePanel, setActivePanel] = useState('store')
  const [products, setProducts] = useState([])
  const [users, setUsers] = useState([])
  const [cartItems, setCartItems] = useState({})
  const [productForm, setProductForm] = useState(emptyProduct)
  const [userForm, setUserForm] = useState(emptyUser)
  const [productImage, setProductImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [editingUserId, setEditingUserId] = useState(null)
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState({ type: 'idle', text: 'Ready' })
  const [loading, setLoading] = useState(false)

  const filteredProducts = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) return products

    return products.filter((product) => {
      return [product.name, product.category, product.description]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [products, query])

  const filteredUsers = useMemo(() => {
    const term = query.trim().toLowerCase()

    if (!term) return users

    return users.filter((user) => {
      return [user.name, user.email, user.role]
        .join(' ')
        .toLowerCase()
        .includes(term)
    })
  }, [users, query])

  const productStats = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + Number(product.price || 0), 0)
    const categories = new Set(products.map((product) => product.category).filter(Boolean)).size

    return { totalValue, categories }
  }, [products])

  const cartCount = useMemo(() => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0)
  }, [cartItems])

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    if (!productImage) {
      setPreviewUrl('')
      return
    }

    const nextPreviewUrl = URL.createObjectURL(productImage)
    setPreviewUrl(nextPreviewUrl)

    return () => URL.revokeObjectURL(nextPreviewUrl)
  }, [productImage])

  const showNotice = (type, text) => {
    setNotice({ type, text })
  }

  const readJson = async (response) => {
    const text = await response.text()
    const contentType = response.headers.get('content-type') || ''
    const data = text && contentType.includes('application/json') ? JSON.parse(text) : {}

    if (text && !contentType.includes('application/json')) {
      throw new Error(`Expected JSON from ${response.url}, received ${contentType || 'unknown response type'}`)
    }

    if (!response.ok) {
      throw new Error(data.errors?.join(', ') || data.message || data.error || 'Request failed')
    }

    return data
  }

  const loadDashboard = async () => {
    try {
      setLoading(true)
      showNotice('idle', 'Refreshing')

      const [productData, userData] = await Promise.all([
        fetch(apiUrl('/api/product')).then(readJson),
        fetch(apiUrl('/api/user')).then(readJson)
      ])

      setProducts(productData.products || [])
      setUsers(userData.users || [])
      showNotice('success', 'Dashboard updated')
    } catch (error) {
      showNotice('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProductField = (event) => {
    const { name, value } = event.target
    setProductForm((current) => ({ ...current, [name]: value }))
  }

  const handleUserField = (event) => {
    const { name, value } = event.target
    setUserForm((current) => ({ ...current, [name]: value }))
  }

  const resetProductForm = () => {
    setProductForm(emptyProduct)
    setProductImage(null)
    setEditingProductId(null)
  }

  const resetUserForm = () => {
    setUserForm(emptyUser)
    setEditingUserId(null)
  }

  const saveProduct = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      const formData = new FormData()

      Object.entries(productForm).forEach(([key, value]) => {
        formData.append(key, value)
      })

      if (productImage) {
        formData.append('image', productImage)
      }

      const url = editingProductId ? apiUrl(`/api/product/${editingProductId}`) : apiUrl('/api/product')
      const method = editingProductId ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        body: formData
      }).then(readJson)

      resetProductForm()
      await loadDashboard()
      showNotice('success', editingProductId ? 'Product updated' : 'Product uploaded')
    } catch (error) {
      showNotice('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const editProduct = (product) => {
    setActivePanel('products')
    setEditingProductId(product._id)
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || ''
    })
    setProductImage(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteProduct = async (productId) => {
    try {
      setLoading(true)
      await fetch(apiUrl(`/api/product/${productId}`), { method: 'DELETE' }).then(readJson)
      await loadDashboard()
      showNotice('success', 'Product deleted')
    } catch (error) {
      showNotice('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveUser = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      const payload = { ...userForm }

      if (editingUserId && !payload.password) {
        delete payload.password
      }

      const url = editingUserId ? apiUrl(`/api/user/${editingUserId}`) : apiUrl('/api/user/register')
      const method = editingUserId ? 'PUT' : 'POST'

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(readJson)

      resetUserForm()
      await loadDashboard()
      showNotice('success', editingUserId ? 'User updated' : 'User created')
    } catch (error) {
      showNotice('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const editUser = (user) => {
    setActivePanel('users')
    setEditingUserId(user._id)
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'user'
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteUser = async (userId) => {
    try {
      setLoading(true)
      await fetch(apiUrl(`/api/user/${userId}`), { method: 'DELETE' }).then(readJson)
      await loadDashboard()
      showNotice('success', 'User deleted')
    } catch (error) {
      showNotice('error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (productId) => {
    setCartItems((current) => ({
      ...current,
      [productId]: (current[productId] || 0) + 1
    }))
    showNotice('success', 'Added to cart')
  }

  return (
    <main className="admin-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">
            <ClipboardList size={22} />
          </div>
          <div>
            <p>Food App</p>
            <h1>Admin</h1>
          </div>
        </div>

        <nav className="panel-switch" aria-label="Admin sections">
          <button
            className={activePanel === 'store' ? 'is-active' : ''}
            type="button"
            onClick={() => setActivePanel('store')}
          >
            <Store size={18} />
            Storefront
          </button>
          <button
            className={activePanel === 'products' ? 'is-active' : ''}
            type="button"
            onClick={() => setActivePanel('products')}
          >
            <Boxes size={18} />
            Products
          </button>
          <button
            className={activePanel === 'users' ? 'is-active' : ''}
            type="button"
            onClick={() => setActivePanel('users')}
          >
            <Users size={18} />
            Users
          </button>
        </nav>

        <div className="sidebar-stats">
          <div>
            <span>{products.length}</span>
            <p>Products</p>
          </div>
          <div>
            <span>{users.length}</span>
            <p>Users</p>
          </div>
          <div>
            <span>{cartCount}</span>
            <p>Cart</p>
          </div>
        </div>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">{activePanel === 'store' ? 'Customer View' : 'Operations'}</p>
            <h2>
              {activePanel === 'store'
                ? 'Food Store'
                : activePanel === 'products'
                  ? 'Product Catalog'
                  : 'User Administration'}
            </h2>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                type="search"
              />
            </div>
            <button className="icon-button" disabled={loading} type="button" onClick={loadDashboard}>
              <RefreshCcw size={18} />
            </button>
          </div>
        </header>

        <div className={`notice ${notice.type}`}>
          {notice.type === 'success' ? <Check size={16} /> : <BadgeCheck size={16} />}
          <span>{notice.text}</span>
        </div>

        {activePanel === 'store' ? (
          <Storefront
            cartCount={cartCount}
            products={filteredProducts}
            onAddToCart={addToCart}
          />
        ) : activePanel === 'products' ? (
          <>
            <section className="metric-grid">
              <Metric icon={<Boxes size={18} />} label="Products" value={products.length} />
              <Metric icon={<Camera size={18} />} label="Categories" value={productStats.categories} />
              <Metric icon={<Upload size={18} />} label="Catalog Value" value={money.format(productStats.totalValue)} />
            </section>

            <section className="work-grid">
              <form className="panel form-panel" onSubmit={saveProduct}>
                <PanelTitle
                  icon={<ImagePlus size={19} />}
                  title={editingProductId ? 'Edit Product' : 'Upload Product'}
                  action={editingProductId ? (
                    <button className="text-button" type="button" onClick={resetProductForm}>
                      <X size={16} />
                      Cancel
                    </button>
                  ) : null}
                />

                <div className="form-grid">
                  <label>
                    Name
                    <input name="name" value={productForm.name} onChange={handleProductField} required />
                  </label>
                  <label>
                    Category
                    <input name="category" value={productForm.category} onChange={handleProductField} required />
                  </label>
                  <label>
                    Price
                    <input name="price" type="number" min="1" value={productForm.price} onChange={handleProductField} required />
                  </label>
                  <label className="wide">
                    Description
                    <textarea name="description" rows="4" value={productForm.description} onChange={handleProductField} required />
                  </label>
                </div>

                <label className="file-upload">
                  <input
                    accept="image/*"
                    required={!editingProductId}
                    type="file"
                    onChange={(event) => setProductImage(event.target.files?.[0] || null)}
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Selected product" />
                  ) : (
                    <span>
                      <ImagePlus size={24} />
                      Product image
                    </span>
                  )}
                </label>

                <button className="primary-button" disabled={loading} type="submit">
                  <Save size={18} />
                  {editingProductId ? 'Save Product' : 'Upload Product'}
                </button>
              </form>

              <section className="panel list-panel">
                <PanelTitle icon={<Boxes size={19} />} title="Products" />
                <div className="product-list">
                  {filteredProducts.map((product) => (
                    <article className="product-row" key={product._id}>
                      <img src={product.imageUrl} alt={product.name} />
                      <div className="product-copy">
                        <div>
                          <h3>{product.name}</h3>
                          <span>{product.category}</span>
                        </div>
                        <p>{product.description}</p>
                      </div>
                      <strong>{money.format(Number(product.price || 0))}</strong>
                      <RowActions
                        onEdit={() => editProduct(product)}
                        onDelete={() => deleteProduct(product._id)}
                        disabled={loading}
                      />
                    </article>
                  ))}
                  {filteredProducts.length === 0 && <EmptyState label="No products found" />}
                </div>
              </section>
            </section>
          </>
        ) : (
          <section className="work-grid users-grid">
            <form className="panel form-panel" onSubmit={saveUser}>
              <PanelTitle
                icon={<UserPlus size={19} />}
                title={editingUserId ? 'Edit User' : 'Create User'}
                action={editingUserId ? (
                  <button className="text-button" type="button" onClick={resetUserForm}>
                    <X size={16} />
                    Cancel
                  </button>
                ) : null}
              />

              <div className="form-grid single">
                <label>
                  Name
                  <input name="name" value={userForm.name} onChange={handleUserField} required />
                </label>
                <label>
                  Email
                  <input name="email" type="email" value={userForm.email} onChange={handleUserField} required />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    minLength="8"
                    value={userForm.password}
                    onChange={handleUserField}
                    required={!editingUserId}
                  />
                </label>
                <label>
                  Role
                  <select name="role" value={userForm.role} onChange={handleUserField}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>
              </div>

              <button className="primary-button" disabled={loading} type="submit">
                <Save size={18} />
                {editingUserId ? 'Save User' : 'Create User'}
              </button>
            </form>

            <section className="panel list-panel">
              <PanelTitle icon={<Users size={19} />} title="Users" />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th aria-label="Actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-pill ${user.role}`}>{user.role}</span>
                        </td>
                        <td>
                          <RowActions
                            onEdit={() => editUser(user)}
                            onDelete={() => deleteUser(user._id)}
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <EmptyState label="No users found" />}
              </div>
            </section>
          </section>
        )}
      </section>
    </main>
  )
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric-card">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

function Storefront({ products, cartCount, onAddToCart }) {
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((product) => product.category).filter(Boolean))]
  }, [products])
  const [selectedCategory, setSelectedCategory] = useState('All')

  const visibleProducts = useMemo(() => {
    if (selectedCategory === 'All') return products

    return products.filter((product) => product.category === selectedCategory)
  }, [products, selectedCategory])

  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All')
    }
  }, [categories, selectedCategory])

  return (
    <section className="storefront">
      <div className="store-hero">
        <div>
          <p className="eyebrow">Fresh Menu</p>
          <h3>Order your favorites</h3>
          <p>Browse the live catalog from your database, just like a customer shopping from your food store.</p>
        </div>
        <div className="cart-summary">
          <ShoppingCart size={22} />
          <span>{cartCount}</span>
        </div>
      </div>

      <div className="category-bar">
        {categories.map((category) => (
          <button
            className={selectedCategory === category ? 'is-active' : ''}
            key={category}
            type="button"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="store-grid">
        {visibleProducts.map((product) => (
          <article className="store-card" key={product._id}>
            <img src={product.imageUrl} alt={product.name} />
            <div className="store-card-body">
              <div className="store-card-head">
                <div>
                  <span>{product.category}</span>
                  <h4>{product.name}</h4>
                </div>
                <strong>{money.format(Number(product.price || 0))}</strong>
              </div>
              <p>{product.description}</p>
              <button className="primary-button" type="button" onClick={() => onAddToCart(product._id)}>
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>
          </article>
        ))}
      </div>

      {visibleProducts.length === 0 && <EmptyState label="No products available" />}
    </section>
  )
}

function PanelTitle({ icon, title, action }) {
  return (
    <div className="panel-title">
      <div>
        {icon}
        <h3>{title}</h3>
      </div>
      {action}
    </div>
  )
}

function RowActions({ onEdit, onDelete, disabled }) {
  return (
    <div className="row-actions">
      <button className="icon-button" disabled={disabled} type="button" onClick={onEdit} aria-label="Edit">
        <Pencil size={16} />
      </button>
      <button className="icon-button danger" disabled={disabled} type="button" onClick={onDelete} aria-label="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="empty-state">
      <Boxes size={24} />
      <span>{label}</span>
    </div>
  )
}

export default App
