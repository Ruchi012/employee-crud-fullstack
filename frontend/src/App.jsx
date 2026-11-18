import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const empty = { name: '', email: '', department: '', salary: '' };

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadEmployees() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/employees`);
      if (!res.ok) throw new Error('Unable to load employees. Check the backend/API URL.');
      setEmployees(await res.json());
    } catch (e) { setMessage(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadEmployees(); }, []);

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setMessage('');
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `${API}/employees/${editing}` : `${API}/employees`;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, salary: Number(form.salary) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      setMessage(editing ? 'Employee updated.' : 'Employee added.');
      setForm(empty); setEditing(null); await loadEmployees();
    } catch (e) { setMessage(e.message); }
  }

  function edit(emp) {
    setEditing(emp.id);
    setForm({ name: emp.name, email: emp.email, department: emp.department, salary: String(emp.salary) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function remove(id) {
    if (!window.confirm('Delete this employee?')) return;
    try {
      const res = await fetch(`${API}/employees/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      setMessage('Employee deleted.');
      if (editing === id) { setEditing(null); setForm(empty); }
      await loadEmployees();
    } catch (e) { setMessage(e.message); }
  }

  function cancel() { setEditing(null); setForm(empty); }

  return <main className="container">
    <header><div><p className="eyebrow">FULL-STACK CRUD PROJECT</p><h1>Employee Management</h1><p className="sub">Create, view, update and delete employee records.</p></div><span className="pill">React · Node · MySQL</span></header>
    <section className="panel">
      <h2>{editing ? 'Update employee' : 'Add employee'}</h2>
      <form onSubmit={submit} className="form">
        <label>Full name<input name="name" value={form.name} onChange={change} required placeholder="e.g. Asha Sharma" /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} required placeholder="asha@example.com" /></label>
        <label>Department<input name="department" value={form.department} onChange={change} required placeholder="e.g. Engineering" /></label>
        <label>Salary<input type="number" min="0" step="0.01" name="salary" value={form.salary} onChange={change} required placeholder="e.g. 45000" /></label>
        <div className="actions"><button type="submit">{editing ? 'Save changes' : 'Add employee'}</button>{editing && <button type="button" className="secondary" onClick={cancel}>Cancel</button>}</div>
      </form>
      {message && <p className="message" role="status">{message}</p>}
    </section>
    <section className="panel">
      <div className="table-heading"><div><h2>Employee records</h2><p className="sub">{employees.length} record(s)</p></div><button className="secondary" onClick={loadEmployees}>Refresh</button></div>
      {loading ? <p>Loading records…</p> : employees.length === 0 ? <p className="empty">No employees yet. Add the first record above.</p> :
      <div className="table-wrap"><table><thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Salary</th><th>Actions</th></tr></thead>
      <tbody>{employees.map(emp => <tr key={emp.id}><td>{emp.id}</td><td>{emp.name}</td><td>{emp.email}</td><td>{emp.department}</td><td>{Number(emp.salary).toLocaleString()}</td><td className="row-actions"><button className="small secondary" onClick={() => edit(emp)}>Edit</button><button className="small danger" onClick={() => remove(emp.id)}>Delete</button></td></tr>)}</tbody></table></div>}
    </section>
    <footer>Learning project · Do not use with real personal or payroll data without adding authentication and security controls.</footer>
  </main>;
}
