// Mock для uuid модуля
export const v4 = () => 'test-uuid-' + Math.random().toString(36).substr(2, 9);
export default { v4 };
