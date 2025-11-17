import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const Modal = ({ open, onOpenChange, children, className }) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-lg duration-200 data-[state=open]:animate-slide-in sm:rounded-lg',
            className
          )}
        >
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ModalHeader = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}>
      {children}
    </div>
  );
};

const ModalTitle = ({ children, className }) => {
  return (
    <Dialog.Title className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
      {children}
    </Dialog.Title>
  );
};

const ModalDescription = ({ children, className }) => {
  return (
    <Dialog.Description className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </Dialog.Description>
  );
};

const ModalBody = ({ children, className }) => {
  return <div className={cn('py-4', className)}>{children}</div>;
};

const ModalFooter = ({ children, className }) => {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  );
};

const ModalClose = ({ children, className, asChild = false }) => {
  return (
    <Dialog.Close asChild={asChild} className={className}>
      {children || (
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </Dialog.Close>
  );
};

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose };
