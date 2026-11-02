const {test}=require('node:test');
const assert=require('node:assert/strict');
const {convert,evaluate}=require('../app.js');
const postfix=s=>convert(s).result.join(' ');
test('course example',()=>{
  const p=postfix('9+3*7+(4*5+6)*2');
  assert.equal(p,'9 3 7 * + 4 5 * 6 + 2 * +');
  assert.equal(evaluate(p).result,82);
});
test('parentheses and precedence',()=>{
  assert.equal(postfix('(3+7)*2'),'3 7 + 2 *');
  assert.equal(evaluate(postfix('(3+7)*2')).result,20);
});
test('operator associativity',()=>{
  assert.equal(postfix('8-3-2'),'8 3 - 2 -');
  assert.equal(evaluate(postfix('8-3-2')).result,3);
  assert.equal(postfix('2^3^2'),'2 3 2 ^ ^');
  assert.equal(evaluate(postfix('2^3^2')).result,512);
});
test('decimals and malformed expressions',()=>{
  assert.equal(evaluate(postfix('1.5+2.5')).result,4);
  assert.throws(()=>convert('3+'));
  assert.throws(()=>convert('(3+2'));
  assert.throws(()=>evaluate('3 +'));
  assert.throws(()=>evaluate('1 0 /'));
});