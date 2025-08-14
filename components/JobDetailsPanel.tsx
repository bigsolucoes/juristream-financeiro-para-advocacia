import React, { useState, useEffect, useRef } from 'react';
import { Job, Client, JobStatus, JobObservation } from '../types';
import { useAppData } from '../hooks/useAppData';
import { formatCurrency, formatDate } from '../utils/formatters';
import { 
    XIcon, PencilIcon, TrashIcon, PlusIcon, CloudLinkIcon, CurrencyDollarIcon, CheckIcon 
} from '../constants';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface JobDetailsPanelProps {
  job: Job;
  client?: Client;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (job: Job) => void;
  onDelete: (jobId: string) => void; 
  onRegisterPayment: (job: Job) => void;
  onRegisterPrePayment: (job: Job) => void; // New prop for success callback
}

const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
  job,
  client,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRegisterPayment,
  onRegisterPrePayment,
}) => {
  const { settings, updateJob } = useAppData();
  const [newObservation, setNewObservation] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Panel closes on backdrop click via parent div
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);


  const handleAddObservation = () => {
    if (!newObservation.trim()) {
      toast.error('Observação não pode estar vazia.');
      return;
    }
    const observation: JobObservation = {
      id: uuidv4(),
      text: newObservation.trim(),
      timestamp: new Date().toISOString(),
    };
    const updatedObservations = [...(job.observationsLog || []), observation];
    updateJob({ ...job, observationsLog: updatedObservations });
    setNewObservation('');
    toast.success('Observação adicionada!');
  };

  const handleRegisterPrePayment = () => {
    if (job.isPrePaid) {
        toast.error("Este job já foi marcado como pré-pago.");
        return;
    }
    if (window.confirm("Confirmar registro de pagamento antecipado para este job?")) {
        const updatedJobData: Job = {
            ...job,
            isPrePaid: true,
            prePaymentDate: new Date().toISOString(),
        };
        updateJob(updatedJobData);
        onRegisterPrePayment(updatedJobData); // Call success callback
    }
  };


  if (!isOpen) return null;

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
        case JobStatus.BRIEFING: return 'bg-slate-200 text-slate-700';
        case JobStatus.PRODUCTION: return 'bg-indigo-200 text-indigo-700';
        case JobStatus.REVIEW: return 'bg-yellow-200 text-yellow-700';
        case JobStatus.FINALIZED: return 'bg-blue-200 text-blue-700';
        case JobStatus.PAID: return 'bg-green-200 text-green-700';
        default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div 
        className={`fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose} 
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()} 
        className={`fixed top-0 right-0 h-full w-full max-w-md md:max-w-lg bg-card-bg shadow-2xl 
                    transform transition-transform duration-300 ease-in-out flex flex-col
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-modal="true"
        role="dialog"
        aria-labelledby="job-details-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border-color sticky top-0 bg-card-bg z-10">
          <h2 id="job-details-panel-title" className="text-xl font-semibold text-text-primary truncate" title={job.name}>
            {job.name}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-accent p-1 rounded-full transition-colors"
            aria-label="Fechar painel"
          >
            <XIcon size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <section>
            <h3 className="text-sm font-medium text-text-secondary mb-1">Status</h3>
            <div className="flex items-center gap-2">
                <p className={`text-sm font-semibold px-2 py-1 inline-block rounded-full ${getStatusColor(job.status)}`}>{job.status}</p>
                {job.isPrePaid && (
                    <span className="flex items-center text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold" title={`Pré-pago em: ${formatDate(job.prePaymentDate)}`}>
                        <CurrencyDollarIcon size={14} className="mr-1"/> Pré-Pago
                    </span>
                )}
            </div>
          </section>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <section>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Cliente</h3>
                <p className="text-text-primary font-medium">{client?.name || 'N/A'}</p>
                {client?.company && <p className="text-xs text-text-secondary">{client.company}</p>}
            </section>
            <section>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Tipo de Serviço</h3>
                <p className="text-text-primary">{job.serviceType}</p>
            </section>
            <section>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Valor</h3>
                <p className="text-text-primary font-semibold">{formatCurrency(job.value, settings.privacyModeEnabled)}</p>
            </section>
            <section>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Prazo</h3>
                <p className="text-text-primary">{formatDate(job.deadline)}</p>
            </section>
             <section>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Criado em</h3>
                <p className="text-text-primary text-xs">{formatDate(job.createdAt, {dateStyle: 'medium', timeStyle: 'short'})}</p>
            </section>
            {job.prePaymentDate && (
                 <section>
                    <h3 className="text-sm font-medium text-text-secondary mb-1">Data Pré-Pagamento</h3>
                    <p className="text-text-primary text-xs">{formatDate(job.prePaymentDate, {dateStyle: 'medium', timeStyle: 'short'})}</p>
                </section>
            )}
          </div>
          
          {(job.cloudLinks && job.cloudLinks.length > 0) && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Links da Nuvem</h3>
              <ul className="space-y-2">
                {job.cloudLinks.map((link, index) => link && (
                  <li key={index} className="flex items-center space-x-2">
                    <CloudLinkIcon size={18} />
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline text-sm truncate"
                      title={link}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.notes && (
            <section>
              <h3 className="text-lg font-semibold text-text-primary mb-2">Notas Gerais</h3>
              <p className="text-sm text-text-secondary whitespace-pre-wrap bg-slate-50 p-3 rounded-md">{job.notes}</p>
            </section>
          )}
          
          <section>
            <h3 className="text-lg font-semibold text-text-primary mb-3">Observações / Atualizações</h3>
            <div className="space-y-3 mb-4">
              {job.observationsLog && job.observationsLog.length > 0 ? (
                [...job.observationsLog].reverse().map(obs => ( 
                  <div key={obs.id} className="bg-slate-100 p-3 rounded-md shadow-sm">
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{obs.text}</p>
                    <p className="text-xs text-text-secondary mt-1 text-right">
                      {formatDate(obs.timestamp, { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-secondary">Nenhuma observação ainda.</p>
              )}
            </div>
            <div className="flex space-x-2">
              <textarea
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                placeholder="Adicionar nova observação..."
                rows={2}
                className="flex-grow p-2 border border-border-color rounded-md focus:ring-2 focus:ring-accent focus:border-accent text-text-primary bg-card-bg outline-none text-sm"
              />
              <button
                onClick={handleAddObservation}
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-md h-fit self-end"
                title="Adicionar Observação"
              >
                <PlusIcon size={20} />
              </button>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border-color sticky bottom-0 bg-card-bg z-10 flex flex-wrap gap-2 justify-end">
          {job.status !== JobStatus.PAID && !job.isPrePaid && (
             <button
                onClick={handleRegisterPrePayment}
                className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm flex items-center"
            >
               <CheckIcon size={18} className="mr-1"/> <span className="ml-1">Pagamento Antecipado</span>
            </button>
          )}
          {job.status !== JobStatus.PAID && (
            <button
                onClick={() => onRegisterPayment(job)}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm flex items-center"
            >
               <CurrencyDollarIcon size={18} /> <span className="ml-1">Registrar Pagamento Final</span>
            </button>
          )}
          <button
            onClick={() => onEdit(job)}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm flex items-center"
          >
            <PencilIcon size={18} /> <span className="ml-1">Editar Job</span>
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition-colors text-sm flex items-center"
          >
           <TrashIcon size={18} /> <span className="ml-1">Mover para Lixeira</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPanel;