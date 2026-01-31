// Simple styleq mock for web compatibility
export function styleq() {
  return {
    className: '',
    style: {}
  };
}

export function create() {
  return styleq;
}

export function merge() {
  return styleq;
}

export default {
  styleq,
  create,
  merge
};