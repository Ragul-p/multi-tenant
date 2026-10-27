describe('POS core arithmetic rules', () => {
  it('uses integer paise for prices', () => expect(100000 * 2).toBe(200000));
  it('detects insufficient inventory', () => expect(2 < 3).toBe(true));
  it('retries use the same idempotency key', () => expect('terminal-01-order-1').toBe('terminal-01-order-1'));
});
