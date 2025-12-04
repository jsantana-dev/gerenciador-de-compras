/**
 * Validators - Funções de validação
 */

/**
 * Valida email
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida se string não está vazia
 */
export function isNotEmpty(value) {
  return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Valida tamanho mínimo
 */
export function minLength(value, min) {
  return value && value.length >= min;
}

/**
 * Valida tamanho máximo
 */
export function maxLength(value, max) {
  return value && value.length <= max;
}

/**
 * Valida se é número
 */
export function isNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Valida se é número positivo
 */
export function isPositive(value) {
  return isNumber(value) && parseFloat(value) > 0;
}

/**
 * Valida se é inteiro
 */
export function isInteger(value) {
  return Number.isInteger(Number(value));
}

/**
 * Valida range de valores
 */
export function inRange(value, min, max) {
  const num = parseFloat(value);
  return isNumber(num) && num >= min && num <= max;
}

/**
 * Valida URL
 */
export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Valida CPF (Brasil)
 */
export function isValidCPF(cpf) {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

/**
 * Valida senha forte
 */
export function isStrongPassword(password) {
  // Mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}

/**
 * Valida data
 */
export function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Valida formulário completo
 */
export function validateForm(formElement) {
  const errors = {};
  const inputs = formElement.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    const name = input.name;
    const value = input.value;
    const type = input.type;

    // Required
    if (input.required && !isNotEmpty(value)) {
      errors[name] = 'Este campo é obrigatório';
      return;
    }

    // Email
    if (type === 'email' && value && !isValidEmail(value)) {
      errors[name] = 'Email inválido';
      return;
    }

    // Number
    if (type === 'number') {
      if (value && !isNumber(value)) {
        errors[name] = 'Deve ser um número válido';
        return;
      }

      const min = input.min;
      const max = input.max;

      if (min && parseFloat(value) < parseFloat(min)) {
        errors[name] = `Valor mínimo: ${min}`;
        return;
      }

      if (max && parseFloat(value) > parseFloat(max)) {
        errors[name] = `Valor máximo: ${max}`;
        return;
      }
    }

    // Password
    if (type === 'password') {
      const minlength = input.minLength;
      if (minlength && value && !minLength(value, minlength)) {
        errors[name] = `Mínimo ${minlength} caracteres`;
        return;
      }
    }

    // Pattern
    if (input.pattern && value) {
      const regex = new RegExp(input.pattern);
      if (!regex.test(value)) {
        errors[name] = input.title || 'Formato inválido';
        return;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Exibe erros de validação no formulário
 */
export function displayFormErrors(formElement, errors) {
  // Limpa erros anteriores
  clearFormErrors(formElement);

  // Exibe novos erros
  Object.keys(errors).forEach(name => {
    const input = formElement.querySelector(`[name="${name}"]`);
    if (!input) return;

    input.classList.add('is-invalid');

    const errorElement = formElement.querySelector(`#${input.id}-error`);
    if (errorElement) {
      errorElement.textContent = errors[name];
      errorElement.classList.add('is-visible');
    }
  });
}

/**
 * Limpa erros de validação do formulário
 */
export function clearFormErrors(formElement) {
  const inputs = formElement.querySelectorAll('.is-invalid');
  inputs.forEach(input => input.classList.remove('is-invalid'));

  const errors = formElement.querySelectorAll('.error-message.is-visible');
  errors.forEach(error => {
    error.textContent = '';
    error.classList.remove('is-visible');
  });
}