const FormField = ({ label, children }) => (
  <div className="field">
    {label && <label>{label}</label>}
    {children}
  </div>
);

export default FormField;
