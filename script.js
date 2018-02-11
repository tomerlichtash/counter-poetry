const CSS_COUNTER = 'my-counter';

let nodes = [];
const rootNode = document.querySelector('.labels');
let counterResetStyleTag = document.createElement('style');
let listStyleTypeTag = document.createElement('style');
let defaultCounterStyleType = 'hebrew';
let playState = null;

// url params
const getUrlParam = (name, url) => {
  if (!url) url = location.href;
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = '[\\?&]' + name + '=([^&#]*)';
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  return results == null ? null : results[1];
}

const hasUrlParams = () => {
  return typeof startAt == 'number' && typeof endAt == 'number' && typeof counterStyleType == 'string'
}

const startAt = Number(getUrlParam('startAt'));
const endAt = Number(getUrlParam('endAt'));
const counterStyleType = getUrlParam('counterStyleType');

// ui dom refs
const countInput = document.querySelector('#count');
const offsetInput = document.querySelector('#offset');
const hideBtn = document.querySelector('#hide');
const showBtn = document.querySelector('#show');
const randBtn = document.querySelector('#rand');
const resetBtn = document.querySelector('#reset');
const playBtn = document.querySelector('#play');
const pauseBtn = document.querySelector('#pause');
const counterTypeSelector = document.querySelector('#counterTypeSelector');
const status = document.querySelector('#status');

// ui events
hideBtn.addEventListener('click', (evt) => resetGrid(false));
showBtn.addEventListener('click', (evt) => resetGrid(true));
randBtn.addEventListener('click', (evt) => setRandomGridValues());
playBtn.addEventListener('click', (evt) => playAnimation());
pauseBtn.addEventListener('click', (evt) => pauseAnimation());

const counterTypes = ['decimal','decimal-leading-zero','arabic-indic','armenian','upper-armenian','lower-armenian','bengali','cambodian','khmer','cjk-decimal','devanagari','georgian','gujarati','gurmukhi','hebrew','kannada','lao','malayalam','mongolian','myanmar','oriya','persian','lower-roman','upper-roman','tamil','telugu','thai','tibetan']

const playAnimation = () => {
  playState = true;
  // setRandomGridValues();
  animate(CSS_COUNTER);
}
const pauseAnimation = () => {
  playState = false;
}

// list-style-type selector
const renderTypeSelector = (defaultStyleType) => {
  return counterTypes.map(type => {
    const option = document.createElement('option');
    option.value = type;
    option.innerHTML = type.toUpperCase();
    option.selected = type === defaultStyleType;
    counterTypeSelector.appendChild(option)
  });
}

// inputs
countInput.addEventListener('change', (evt) => onCountChange())
offsetInput.addEventListener('change', (evt) => onOffsetChange())
counterTypeSelector.addEventListener('change', (evt) => setCounterType(evt.target.value))

// css counter
document.body.appendChild(counterResetStyleTag);
document.body.appendChild(listStyleTypeTag);

const setStatus = (msg) => {
  status.innerHTML = msg;
}

const createNode = (index) => {
  const el = document.createElement('label');
  const input = document.createElement('input')
  const span = document.createElement('span');
  input.type = 'checkbox';
  input.checked = true;
  el.appendChild(input);
  el.appendChild(span);
  // el.setAttribute('data-debug', index);
  return el;
}

const addNode = (node) => {
  nodes.push(node);
  document.querySelector('.labels').appendChild(node);
}

const getNodes = () => {
  return Array.prototype.slice.call(nodes);
}

const getInputs = () => {
  return getNodes().map(label => label.querySelector('input[type="checkbox"]'));
}

const resetGrid = (isChecked) => {
  getInputs().map((input, index) => input.checked = isChecked || false);
  updateStatus();
}

const setRandomGridValues = () => {
  const inputs = getInputs();
  const randVals = inputs.map((d, index) => Math.floor(Math.random() * inputs.length) % 2); 
  resetGrid();
  randVals.map((r, index) => getInputs()[index].checked = r);
  updateStatus();
}

const updateStatus = () => {
  const inputs = getInputs();
  const current = inputs.filter((input, index) => input.checked);
  setStatus(`${current.length}/${inputs.length}`)
}

const getOffsetValue = () => {
  return Number(offsetInput.value);
}

const getCountValue = () => {
  return Number(countInput.value);
}

const resetCSSCounter = (limit, counterName) => {
  counterResetStyleTag.innerHTML = `body{counter-reset: ${counterName} ${limit}}`;
}

const resetAll = (cssResetVal) => {
  const nodes = rootNode.querySelectorAll('label');
  Array.prototype.slice.call(nodes).map((node, index) => rootNode.removeChild(node));
  resetCSSCounter(cssResetVal, CSS_COUNTER);
  items = [];
}

const onOffsetChange = () => {
  if (getCountValue() < getOffsetValue()) {
    resetAll(-1);
    return false;
  }
  resetAll(getOffsetValue());
  render();
}

const onCountChange = () => {
  resetAll(getOffsetValue());
  render();
}

const setCounterType = (counterType) => {
  document.querySelector('body').setAttribute('data-list-type', counterType);
}

const resetValues = (count, offset) => {
  countInput.value = count;
  offsetInput.value = offset;
}

const render = () => {
  const nodeCount = getCountValue() - getOffsetValue();
  if (nodeCount < 0) resetGrid(false);
  Array(nodeCount).fill().map((n, index) => addNode(createNode(index)));
  updateStatus();
}

const animate = () => {
  return new Promise(resolve =>
    setTimeout(() => {
      const checkedNodes = getNodes().filter(node => node.querySelector('input').checked);
      if (!checkedNodes.length || !playState) {
        playState = false;
        resolve({playState});
        return playState;
      }

      const randVal = Math.random();
      const randIndexBool = randVal > 0.5;
      const randIndex = Math.floor(randVal * checkedNodes.length);
      
      const randomEl = checkedNodes[randIndex];
      const randomElInput = randomEl.querySelector('input');
      
      randomEl.setAttribute('data-tracked', 'tracked');
      setTimeout(() => randomEl.removeAttribute('data-tracked'), 1450);
      
      animate();
      resolve();
    }, 50)
  )
}

const shuffleGrid = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('shuffle')
      setRandomGridValues();
      shuffleGrid();
      resolve();
    }, Math.random() * 5000);
  });
}

const init = (cssCounterRef, counterStyleType) => {
  renderTypeSelector(counterStyleType);
  resetCSSCounter(getOffsetValue(), cssCounterRef);
  setCounterType(counterStyleType);
  
  if (hasUrlParams()) {
    resetValues(endAt, startAt);
  }

  render();
  shuffleGrid();
  playAnimation();
}

init(CSS_COUNTER, defaultCounterStyleType);