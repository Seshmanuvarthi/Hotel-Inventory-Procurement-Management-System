import React from 'react';

const StyledInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-text-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-4 py-3 border-2 rounded-lg
          bg-card text-text-dark placeholder-text-dark/50
          border-secondary/20
          focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none
          transition-all duration-300
          hover:border-secondary/40
          ${error ? 'border-red-300 focus:border-red-500' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const StyledSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-text-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-4 py-3 border-2 rounded-lg
          bg-card text-text-dark
          border-secondary/20
          focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none
          transition-all duration-300
          hover:border-secondary/40
          ${error ? 'border-red-300 focus:border-red-500' : ''}
        `}
        {...props}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const StyledTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  required = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-text-dark">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`
          w-full px-4 py-3 border-2 rounded-lg
          bg-card text-text-dark placeholder-text-dark/50
          border-secondary/20
          focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none
          transition-all duration-300
          hover:border-secondary/40
          resize-vertical
          ${error ? 'border-red-300 focus:border-red-500' : ''}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const StyledForm = ({ fields = [], formData, onChange }) => {
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  if (!Array.isArray(fields)) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {fields.map((field, index) => {
        const { type, name, ...rest } = field;
        const value = name.includes('.') ? getNestedValue(formData, name) : formData[name];

        switch (type) {
          case 'select':
            return <StyledSelect key={index} name={name} value={value} onChange={onChange} {...rest} />;
          case 'textarea':
            return <StyledTextarea key={index} name={name} value={value} onChange={onChange} {...rest} />;
          default:
            return <StyledInput key={index} name={name} value={value} onChange={onChange} {...rest} />;
        }
      })}
    </div>
  );
};

StyledForm.Input = StyledInput;
StyledForm.Select = StyledSelect;
StyledForm.Textarea = StyledTextarea;

export default StyledForm;
