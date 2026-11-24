import { ALL_CENTRES, userSchema } from './userSchema';

const valid = {
  name: 'Ravi Kumar',
  email: ' Ravi@ExamPro.in ',
  role: 'admin',
  mobile: '',
  centre: ALL_CENTRES,
  status: 'active',
};

describe('userSchema', () => {
  it('accepts a user without a mobile number and tidies the email', () => {
    expect(userSchema.parse(valid).email).toBe('ravi@exampro.in');
  });

  it.each(['9876543210', '+91 98765 43210'])('accepts mobile %s', (mobile) => {
    expect(userSchema.safeParse({ ...valid, mobile }).success).toBe(true);
  });

  it.each(['12345', 'abcdefghij', '+', '9876543210 '.repeat(2)])(
    'rejects mobile "%s"',
    (mobile) => {
      expect(userSchema.safeParse({ ...valid, mobile }).success).toBe(false);
    },
  );

  it('requires a role', () => {
    const result = userSchema.safeParse({ ...valid, role: '' });
    expect(result.error?.issues[0]?.message).toBe('Select a role');
  });
});
