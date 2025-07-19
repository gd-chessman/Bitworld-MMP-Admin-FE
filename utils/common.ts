

// Custom styles for react-select
export const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      borderColor: state.isFocused ? 'rgb(34, 197, 94)' : 'rgba(71, 85, 105, 0.5)',
      borderWidth: '1px',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px rgb(34, 197, 94)' : 'none',
      '&:hover': {
        borderColor: 'rgba(71, 85, 105, 0.7)',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(15, 23, 42)',
      border: '1px solid rgba(71, 85, 105, 0.5)',
      borderRadius: '6px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(71, 85, 105, 0.5)' : 'transparent',
      color: state.isFocused ? 'rgb(241, 245, 249)' : 'rgb(148, 163, 184)',
      '&:hover': {
        backgroundColor: 'rgba(71, 85, 105, 0.5)',
        color: 'rgb(241, 245, 249)',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'rgb(241, 245, 249)',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'rgb(241, 245, 249)',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'rgb(148, 163, 184)',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(71, 85, 105, 0.5)',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: 'rgb(148, 163, 184)',
      '&:hover': {
        color: 'rgb(34, 197, 94)',
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: 'rgb(148, 163, 184)',
      '&:hover': {
        color: 'rgb(239, 68, 68)',
      },
    }),
  };