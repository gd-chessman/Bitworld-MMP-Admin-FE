

// Custom styles for react-select
export const selectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      borderColor: state.isFocused ? 'hsl(var(--primary))' : 'hsl(var(--border))',
      borderWidth: '1px',
      borderRadius: '6px',
      boxShadow: state.isFocused ? '0 0 0 1px hsl(var(--primary))' : 'none',
      '&:hover': {
        borderColor: 'hsl(var(--border))',
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--background))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '6px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'hsl(var(--muted))' : 'transparent',
      color: state.isFocused ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
      '&:hover': {
        backgroundColor: 'hsl(var(--muted))',
        color: 'hsl(var(--foreground))',
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--foreground))',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: 'hsl(var(--border))',
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--primary))',
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: 'hsl(var(--muted-foreground))',
      '&:hover': {
        color: 'hsl(var(--destructive))',
      },
    }),
  };