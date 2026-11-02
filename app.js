'use strict';
const OPS={'+':{p:1,a:'L',f:(a,b)=>a+b},'-':{p:1,a:'L',f:(a,b)=>a-b},'*':{p:2,a:'L',f:(a,b)=>a*b},'/':{p:2,a:'L',f:(a,b)=>a/b},'^':{p:3,a:'R',f:(a,b)=>a**b}};
const EXAMPLE='9+3*7+(4*5+6)*2';
const num=t=>/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(t);
const fmt=n=>Number.isInteger(n)?String(n):String(Number(n.toPrecision(12)));
const pretty=x=>x==='*'?'×':x==='/'?'÷':String(x);
function tokenize(src){
  const s=src.replace(/\s+/g,'');if(!s)throw Error('请输入中缀表达式。');
  const t=s.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+*\-/^]/g);
  if(!t||t.join('')!==s)throw Error('含有不支持的字符。');
  return t;
}
function validate(t){
  let operand=true,depth=0;
  for(const x of t){
    if(num(x)){if(!operand)throw Error('操作数之间缺少运算符。');operand=false;}
    else if(x==='('){if(!operand)throw Error('不支持隐式乘法。');depth++;}
    else if(x===')'){if(operand)throw Error('右括号前缺少操作数。');depth--;if(depth<0)throw Error('括号不匹配。');operand=false;}
    else if(OPS[x]){if(operand)throw Error('运算符前缺少操作数；负数请写成 (0-3)。');operand=true;}
  }
  if(depth)throw Error('括号不匹配。');
  if(operand)throw Error('表达式末尾缺少操作数。');
}
function convert(src){
  const t=tokenize(src);validate(t);
  const stack=[],out=[],steps=[{stack:[],out:[],active:-1,msg:'初始化：栈与输出序列为空。'}];
  const save=(i,msg)=>steps.push({stack:[...stack],out:[...out],active:i,msg});
  t.forEach((x,i)=>{
    if(num(x)){out.push(x);save(i,'读取操作数 '+x+'，直接输出。');}
    else if(x==='('){stack.push(x);save(i,'左括号入栈，开始新的括号作用域。');}
    else if(x===')'){
      while(stack.length&&stack.at(-1)!=='(')out.push(stack.pop());
      if(stack.pop()!=='(')throw Error('括号不匹配。');
      save(i,'弹出直到左括号为止的运算符，左右括号均不输出。');
    }else{
      const popped=[];
      while(stack.length&&stack.at(-1)!=='('&&
      (OPS[stack.at(-1)].p>OPS[x].p||(OPS[stack.at(-1)].p===OPS[x].p&&OPS[x].a==='L'))){
        popped.push(stack.pop());out.push(popped.at(-1));
      }
      stack.push(x);
      save(i,(popped.length?'先输出 '+popped.map(pretty).join('、')+'；':'')+'将 '+pretty(x)+' 入栈。');
    }
  });
  const popped=[];while(stack.length){const x=stack.pop();if(x==='(')throw Error('括号不匹配。');out.push(x);popped.push(x);}
  save(t.length,'读取结束，输出剩余运算符'+(popped.length?'：'+popped.map(pretty).join('、'):'（栈已空）')+'。');
  return {tokens:t,steps,result:out};
}
function evaluate(src){
  const t=src.trim().split(/\s+/).filter(Boolean);
  if(!t.length)throw Error('请输入后缀表达式，token 之间用空格分隔。');
  const stack=[],steps=[{stack:[],out:[],active:-1,msg:'初始化：数值栈为空。'}];
  for(let i=0;i<t.length;i++){
    const x=t[i];let msg;
    if(num(x)){stack.push(Number(x));msg='读取 '+x+'，压入数值栈。';}
    else if(OPS[x]){
      if(stack.length<2)throw Error(pretty(x)+' 缺少两个操作数。');
      const b=stack.pop(),a=stack.pop();
      if(x==='/'&&b===0)throw Error('除数不能为 0。');
      const r=OPS[x].f(a,b);if(!Number.isFinite(r))throw Error('结果不是有限数。');
      stack.push(r);msg='先弹出右操作数 '+b+'，再弹出左操作数 '+a+'；计算 '+a+' '+pretty(x)+' '+b+' = '+fmt(r)+'，结果入栈。';
    }else throw Error('不支持的后缀 token：'+x);
    steps.push({stack:[...stack],out:[],active:i,msg});
  }
  if(stack.length!==1)throw Error('后缀表达式不完整：栈中应恰好剩一个数。');
  steps.push({stack:[...stack],out:[],active:t.length,msg:'求值完成，最终结果为 '+fmt(stack[0])+'。'});
  return {tokens:t,steps,result:stack[0]};
}
if(typeof module!=='undefined'&&module.exports)module.exports={tokenize,convert,evaluate};
if(typeof document!=='undefined'){
  const $=id=>document.getElementById(id);
  let mode='convert',data=null,step=0,timer=null,lastPostfix='';
  const nodes=(id,values,cl)=>{const el=$(id);el.replaceChildren();values.forEach(v=>{const s=document.createElement('span');s.className=cl;s.textContent=v;el.append(s);});};
  function stop(){if(timer!==null){clearInterval(timer);timer=null;}$('play').textContent='▶ 自动播放';}
  function render(){
    if(!data)return;
    const s=data.steps[step];$('count').textContent='步骤 '+step+' / '+(data.steps.length-1);
    $('seek').value=step;$('seek').max=data.steps.length-1;
    const t=$('tokens');t.replaceChildren();
    data.tokens.forEach((x,i)=>{const z=document.createElement('span');z.className='token'+(i===s.active?' current':i<s.active?' done':'');z.textContent=pretty(x);t.append(z);});
    if(s.active===data.tokens.length){const z=document.createElement('span');z.className='token current';z.textContent='END';t.append(z);}
    const st=$('stack');st.replaceChildren();
    if(!s.stack.length)nodes('stack',['空栈'],'placeholder');
    else [...s.stack].reverse().forEach(v=>{const z=document.createElement('span');z.className='stack-item'+(mode==='evaluate'?' value':'');z.textContent=mode==='evaluate'?fmt(v):pretty(v);st.append(z);});
    if(mode==='convert')nodes('result',s.out.map(pretty),'out');
    else nodes('result',s.stack.length?[s.stack.map(fmt).join(' , ')]:[],'out');
    if(!$('result').childElementCount)nodes('result',['尚无输出'],'placeholder');
    $('message').textContent=s.msg;
    $('prev').disabled=step===0;$('next').disabled=step===data.steps.length-1;
  }
  function go(n){if(!data)return;step=Math.max(0,Math.min(n,data.steps.length-1));render();if(step===data.steps.length-1)stop();}
  function generate(){
    stop();$('error').textContent='';
    try{
      const src=$('expression').value;
      data=mode==='convert'?convert(src):evaluate(src);step=0;
      if(mode==='convert')lastPostfix=data.result.join(' ');
      render();
    }catch(e){data=null;$('error').textContent=e.message;['stack','result','tokens'].forEach(id=>$(id).replaceChildren());$('message').textContent='修正输入后重新生成步骤。';$('count').textContent='无步骤';$('prev').disabled=true;$('next').disabled=true;$('play').disabled=true;}
    if(data)$('play').disabled=false;
  }
  function setMode(m){
    stop();mode=m;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===m));
    $('expression').value=m==='convert'?EXAMPLE:lastPostfix||'9 3 7 * + 4 5 * 6 + 2 * +';
    $('input-label').textContent=m==='convert'?'输入中缀表达式（Infix）':'输入后缀表达式（Postfix；空格分隔）';
    $('stack-title').textContent=m==='convert'?'运算符栈（栈顶在上）':'数值栈（栈顶在上）';
    $('result-title').textContent=m==='convert'?'Postfix 输出':'当前数值栈';
    $('visual-title').textContent=m==='convert'?'逐步转换':'逐步求值';
    $('rules').textContent=m==='convert'?'操作数直接输出；运算符按优先级和结合性入栈或出栈；括号限定作用域。':'数字入栈；运算符出现时依次弹出右、左操作数，计算后将结果入栈。';
    generate();
  }
  function showPage(p){$('home').hidden=p!=='home';$('lesson').hidden=p!=='lesson';$('breadcrumb').textContent=p==='home'?'课程首页':'栈与表达式';document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===p));}
  document.querySelectorAll('[data-page]').forEach(b=>b.addEventListener('click',()=>showPage(b.dataset.page)));
  document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{showPage('lesson');setMode(b.dataset.go);}));
  document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
  $('generate').onclick=generate;$('expression').onkeydown=e=>{if(e.key==='Enter')generate();};
  $('sample').onclick=()=>{setMode(mode);};
  $('prev').onclick=()=>{stop();go(step-1);};$('next').onclick=()=>{stop();go(step+1);};
  $('reset').onclick=()=>{stop();go(0);};$('seek').oninput=e=>{stop();go(Number(e.target.value));};
  $('play').onclick=()=>{if(timer!==null){stop();return;}if(!data)return;if(step===data.steps.length-1)go(0);$('play').textContent='⏸ 暂停';timer=setInterval(()=>go(step+1),850);};
  setMode('convert');showPage('home');
}