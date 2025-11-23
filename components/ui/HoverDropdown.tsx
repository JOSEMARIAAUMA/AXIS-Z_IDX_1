
import React, { useState, useMemo } from 'react';

type DropdownOption = string | number | { value: string | number; label: string | number };

interface HoverDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const HoverDropdown: React.FC<HoverDropdownProps> = ({ label, options, value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue: string | number) => {
    onChange(String(optionValue));
    setIsOpen(false);
  };
  
  const getOptionValue = (option: DropdownOption): string | number => {
    if (option === null || option === undefined) return '';
    if (typeof option === 'string' || typeof option === 'number') {
      return option;
    }
    return option.value;
  };

  const getOptionLabel = (option: DropdownOption): string | number => {
    if (option === null || option === undefined) return '';
    if (typeof option === 'string' || typeof option === 'number') {
      return option;
    }
    return option.label;
  };

  const selectedLabel = useMemo(() => {
    if (!value) return 'Todos';
    const selectedOption = options.find(opt => String(getOptionValue(opt)) === value);
    return selectedOption ? getOptionLabel(selectedOption) : 'Todos';
  }, [options, value]);

  return (
    <div 
      className={`relative min-w-0 ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <label className="block text-[10px] font-medium text-brand-text-secondary mb-0.5 truncate uppercase tracking-wide">{label}</label>
      <div className="block w-full bg-brand-surface text-brand-text rounded-md py-1 px-1.5 text-xs flex items-center cursor-pointer h-[28px] border border-transparent hover:border-brand-primary transition-colors">
        <span className={`truncate block w-full ${value ? 'text-brand-text font-medium' : 'text-brand-text-secondary'}`}>
          {selectedLabel}
        </span>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full min-w-[120px] z-50 pt-1">
          <div className="bg-brand-bg-light border border-brand-surface rounded-md shadow-xl max-h-60 overflow-y-auto">
            <ul>
              <li
                className={`p-2 text-xs cursor-pointer hover:bg-brand-primary/20 transition-colors ${!value ? 'bg-brand-primary/20 text-brand-primary font-medium' : 'text-brand-text-secondary hover:text-brand-primary'}`}
                onClick={() => handleSelect('')}
              >
                Todos
              </li>
              {options.map((opt, index) => {
                const optValue = getOptionValue(opt);
                const optLabel = getOptionLabel(opt);
                return (
                  <li
                    key={`${String(optValue)}-${index}`}
                    className={`p-2 text-xs cursor-pointer hover:bg-brand-primary/20 transition-colors truncate ${String(value) === String(optValue) ? 'bg-brand-primary/20 text-brand-primary font-medium' : 'text-brand-text hover:text-brand-primary'}`}
                    onClick={() => handleSelect(optValue)}
                    title={String(optLabel)}
                  >
                    {optLabel}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default HoverDropdown;
