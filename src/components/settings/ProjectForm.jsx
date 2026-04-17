import { useState } from 'react';

const WEBHOOK_FORMATS = [
  { value: 'ycloud', label: 'YCloud' },
  { value: 'evolution', label: 'Evolution API' },
  { value: 'custom', label: 'Custom' },
];

export default function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: project?.name || '',
    clientName: project?.clientName || '',
    webhookUrl: project?.webhookUrl || '',
    webhookFormat: project?.webhookFormat || 'ycloud',
    agentPhoneNumber: project?.agentPhoneNumber || '',
    testPhoneNumbers: project?.testPhoneNumbers?.join(', ') || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.clientName.trim()) errs.clientName = 'Required';
    if (!form.webhookUrl.trim()) errs.webhookUrl = 'Required';
    if (form.webhookUrl && !form.webhookUrl.startsWith('http')) errs.webhookUrl = 'Must be a valid URL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      clientName: form.clientName.trim(),
      webhookUrl: form.webhookUrl.trim(),
      webhookFormat: form.webhookFormat,
      agentPhoneNumber: form.agentPhoneNumber.trim(),
      testPhoneNumbers: form.testPhoneNumbers
        .split(',')
        .map(p => p.trim())
        .filter(Boolean),
    });
  };

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="bg-surface-800 border border-surface-400/50 rounded-xl p-6 animate-fade-in">
      <h3 className="font-mono text-sm uppercase tracking-wider text-accent mb-6">
        {project ? 'Edit Project' : 'New Project'}
      </h3>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <Field label="Project Name" error={errors.name}>
          <input value={form.name} onChange={update('name')} placeholder="e.g., Eventos Rosario" className={inputClass} />
        </Field>
        <Field label="Agent Name" error={errors.clientName}>
          <input value={form.clientName} onChange={update('clientName')} placeholder="e.g., Gabriela" className={inputClass} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-5">
        <div className="col-span-2">
          <Field label="Webhook URL" error={errors.webhookUrl}>
            <input value={form.webhookUrl} onChange={update('webhookUrl')} placeholder="https://..." className={inputClass + ' font-mono text-xs'} />
          </Field>
        </div>
        <Field label="Payload Format">
          <select value={form.webhookFormat} onChange={update('webhookFormat')} className={inputClass}>
            {WEBHOOK_FORMATS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-8">
        <Field label="Agent Phone Number">
          <input value={form.agentPhoneNumber} onChange={update('agentPhoneNumber')} placeholder="+56975283845" className={inputClass + ' font-mono text-xs'} />
        </Field>
        <Field label="Test Phone Numbers (comma-separated)">
          <input value={form.testPhoneNumbers} onChange={update('testPhoneNumbers')} placeholder="+1234567890, +0987654321" className={inputClass + ' font-mono text-xs'} />
        </Field>
      </div>

      <div className="flex items-center gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider text-surface-200 hover:text-surface-50 hover:bg-surface-700 transition-all">
          Cancel
        </button>
        <button type="submit" className="px-6 py-2.5 rounded-lg bg-accent text-surface-900 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-accent-hover transition-all">
          {project ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}

const inputClass = 'w-full bg-surface-700 border border-surface-400 rounded-lg px-3 py-2.5 text-sm text-surface-50 placeholder:text-surface-300 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors';

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-surface-200 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
