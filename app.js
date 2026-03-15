// 간단한 카운터 앱
let count = 0;

function increment() {
  count++;
  console.log(`count: ${count}`);
}

function decrement() {
  count--;
  console.log(`count: ${count}`);
}

function reset() {
  count = 0;
  console.log(`count: ${count}`);
}
