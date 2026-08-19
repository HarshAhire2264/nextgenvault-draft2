import { useState } from 'react';
import { FileText, Plus, Trash2, Download, FileImage, FileType, KeyRound, Upload } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface DocumentsTabProps {
  ownerId: string;
}

function fileIcon(type: string) {
  if (type === 'image') return FileImage;
  if (type === 'pdf') return FileType;
  return FileText;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function DocumentsTab({ ownerId }: DocumentsTabProps) {
  const { documents, liabilities, addDocument, deleteDocument } = useApp();
  const [showForm, setShowForm] = useState(false);
  const myDocs = documents.filter((d) => d.ownerId === ownerId);
  const myLiabilities = liabilities.filter((l) => l.ownerId === ownerId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink-900">Documents</h2>
          <p className="text-sm text-ink-500">Upload and manage documents linked to your liabilities.</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> Upload document
        </Button>
      </div>

      {myDocs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
          <FileText className="mx-auto h-10 w-10 text-ink-300" />
          <p className="mt-3 text-sm font-medium text-ink-500">No documents uploaded yet.</p>
          <p className="text-xs text-ink-400">Upload recovery codes, instructions, or sealed documents.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myDocs.map((d) => {
            const Icon = fileIcon(d.fileType);
            const linkedLiab = myLiabilities.find((l) => l.id === d.liabilityId);
            return (
              <div key={d.id} className="rounded-2xl border border-ink-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ink-900 leading-tight">{d.title}</h3>
                      <p className="text-xs text-ink-500">{d.fileName}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteDocument(d.id)} className="rounded-lg p-1.5 text-ink-400 hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 space-y-1.5 text-xs text-ink-500">
                  <p>{d.fileSize} · Uploaded {formatDate(d.uploadedAt)}</p>
                  {linkedLiab && (
                    <div className="flex items-center gap-1.5">
                      <KeyRound className="h-3 w-3" /> Linked to: <span className="text-ink-700">{linkedLiab.title}</span>
                    </div>
                  )}
                </div>
                {d.description && <p className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-500">{d.description}</p>}
                <div className="mt-4 flex items-center justify-between border-t border-ink-100 pt-3">
                  <Badge tone="brand">{d.fileType.toUpperCase()}</Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <DocumentFormModal
          liabilities={myLiabilities}
          onClose={() => setShowForm(false)}
          onSave={(data) => { addDocument(data); setShowForm(false); }}
        />
      )}
    </div>
  );
}

function DocumentFormModal({
  liabilities,
  onClose,
  onSave,
}: {
  liabilities: { id: string; title: string }[];
  onClose: () => void;
  onSave: (data: { title: string; fileName: string; fileType: 'pdf' | 'image' | 'doc'; fileSize: string; description?: string; liabilityId?: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'doc'>('pdf');
  const [fileSize, setFileSize] = useState('128 KB');
  const [description, setDescription] = useState('');
  const [liabilityId, setLiabilityId] = useState('');

  return (
    <Modal
      open
      onClose={onClose}
      title="Upload document"
      description="Attach a document to your vault or link it to a specific liability."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ title, fileName, fileType, fileSize, description: description || undefined, liabilityId: liabilityId || undefined })} disabled={!title.trim() || !fileName.trim()}>
            Upload
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label-text">Document title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="e.g. Recovery Codes — Gmail" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">File name *</label>
            <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} className="input-field" placeholder="document.pdf" />
          </div>
          <div>
            <label className="label-text">File type</label>
            <select value={fileType} onChange={(e) => setFileType(e.target.value as 'pdf' | 'image' | 'doc')} className="input-field">
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="doc">Document</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label-text">File size</label>
          <input type="text" value={fileSize} onChange={(e) => setFileSize(e.target.value)} className="input-field" placeholder="128 KB" />
        </div>
        <div>
          <label className="label-text">Link to liability (optional)</label>
          <select value={liabilityId} onChange={(e) => setLiabilityId(e.target.value)} className="input-field">
            <option value="">No specific liability</option>
            {liabilities.map((l) => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text">Description (optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field min-h-[80px] resize-none" placeholder="What does this document contain?" />
        </div>
        <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-ink-200 px-4 py-6 text-center">
          <Upload className="mx-auto h-5 w-5 text-ink-300" />
          <p className="text-xs text-ink-400">File upload is simulated in this prototype.</p>
        </div>
      </div>
    </Modal>
  );
}
