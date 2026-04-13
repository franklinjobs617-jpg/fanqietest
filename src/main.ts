import './index.css';
import {
  PomodoroTimer,
  TodoManager,
  formatTime,
  requestNotificationPermission,
  showNotification,
  PomodoroState,
  TodoItem,
} from './pomodoro';

export function initApp(): void {
  const app = document.getElementById('app');
  if (!app) {
    console.error('App element not found');
    return;
  }

  requestNotificationPermission();

  let isDarkMode = localStorage.getItem('theme') === 'dark';
  
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  }

  let timer: PomodoroTimer | null = null;
  let todos: TodoManager | null = null;
  let currentState: PomodoroState;
  let currentTodos: TodoItem[] = [];
  let newTodoText = '';
  let currentTime = formatCurrentTime();
  let currentDate = formatCurrentDate();

  setInterval(() => {
    currentTime = formatCurrentTime();
    currentDate = formatCurrentDate();
    if (app) {
      const timeEl = document.getElementById('current-time');
      const dateEl = document.getElementById('current-date');
      if (timeEl) timeEl.textContent = currentTime;
      if (dateEl) dateEl.textContent = currentDate;
    }
  }, 1000);

  function formatCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function formatCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekday = weekdays[now.getDay()];
    return `${year}/${month}/${day} ${weekday}`;
  }

  function toggleTheme(): void {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    render();
  }

  function render(): void {
    if (!app) return;

    const completedTodos = currentTodos.filter((t) => t.completed).length;
    const activeTodos = currentTodos.filter((t) => !t.completed).length;
    const progress = currentState.isWork
      ? (1 - currentState.timeLeft / currentState.workDuration) * 100
      : (1 - currentState.timeLeft / currentState.breakDuration) * 100;

    const bgGradient = isDarkMode 
      ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
      : 'bg-gradient-to-br from-sky-50 via-white to-teal-50';
    const textPrimary = isDarkMode ? 'text-white' : 'text-slate-800';
    const textSecondary = isDarkMode ? 'text-slate-300' : 'text-slate-600';
    const textMuted = isDarkMode ? 'text-slate-400' : 'text-slate-400';
    const cardBg = isDarkMode ? 'bg-slate-800/80' : 'bg-white/80';
    const borderColor = isDarkMode ? 'border-slate-700' : 'border-slate-100';
    const inputBg = isDarkMode ? 'bg-slate-700/50' : 'bg-slate-50';
    const inputBorder = isDarkMode ? 'border-slate-600' : 'border-slate-200';
    const inputText = isDarkMode ? 'text-white' : 'text-slate-700';
    const inputPlaceholder = isDarkMode ? 'placeholder-slate-400' : 'placeholder-slate-300';
    const btnSecondaryBg = isDarkMode ? 'bg-slate-700' : 'bg-slate-100';
    const btnSecondaryHover = isDarkMode ? 'hover:bg-slate-600' : 'hover:bg-slate-200';
    const btnSecondaryText = isDarkMode ? 'text-slate-300' : 'text-slate-500';
    const todoItemBg = isDarkMode ? 'bg-slate-700/30' : 'bg-slate-50';
    const todoBorder = isDarkMode ? 'border-slate-600/50' : 'border-slate-100';
    const todoHoverBorder = isDarkMode ? 'hover:border-slate-500' : 'hover:border-slate-200';
    const tipBg = isDarkMode ? 'bg-orange-500/10' : 'bg-gradient-to-r from-orange-50 to-teal-50';
    const tipBorder = isDarkMode ? 'border-orange-500/20' : 'border-slate-100';
    const tipText = isDarkMode ? 'text-slate-300' : 'text-slate-500';
    const footerText = isDarkMode ? 'text-slate-500' : 'text-slate-400';

    app.innerHTML = `
      <div class="min-h-screen ${bgGradient} ${textPrimary} p-4 md:p-6">
        <div class="max-w-4xl mx-auto">
          
          <!-- Header -->
          <header class="text-center mb-6 md:mb-8">
            <!-- Theme Toggle -->
            <button
              id="btn-theme"
              class="theme-toggle w-10 h-10 rounded-full ${btnSecondaryBg} ${btnSecondaryHover} ${btnSecondaryText} flex items-center justify-center text-lg"
            >
              ${isDarkMode ? '☀️' : '🌙'}
            </button>
            
            <!-- Clock -->
            <div class="inline-flex flex-col items-center">
              <div id="current-time" class="text-4xl sm:text-5xl md:text-5xl font-light tracking-wider ${textPrimary}">
                ${currentTime}
              </div>
              <div id="current-date" class="text-sm md:text-base ${textMuted} mt-1">
                ${currentDate}
              </div>
            </div>
            
            <h1 class="text-xl md:text-2xl font-semibold mt-4 md:mt-6 ${textSecondary}">
              🍅 番茄时钟
            </h1>
            <p class="text-sm ${textMuted} mt-1">专注工作，定时休息</p>
          </header>

          <!-- Main Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <!-- Timer Section -->
            <div class="${cardBg} backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border ${borderColor}">
              <!-- Mode Indicator -->
              <div class="flex justify-center mb-4 md:mb-6">
                <div class="inline-flex gap-1 p-1 ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100'} rounded-full">
                  <button
                    id="mode-work"
                    class="px-4 md:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentState.isWork
                        ? `${isDarkMode ? 'bg-slate-600' : 'bg-white'} text-orange-500 shadow-md`
                        : `${textMuted} hover:${textSecondary}`
                    }"
                  >
                    工作 25 分钟
                  </button>
                  <button
                    id="mode-break"
                    class="px-4 md:px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      !currentState.isWork
                        ? `${isDarkMode ? 'bg-slate-600' : 'bg-white'} text-teal-400 shadow-md`
                        : `${textMuted} hover:${textSecondary}`
                    }"
                  >
                    休息 5 分钟
                  </button>
                </div>
              </div>

              <!-- Timer Display -->
              <div class="text-center mb-6 md:mb-8">
                <div class="relative inline-flex items-center justify-center">
                  <svg class="w-44 h-44 sm:w-52 sm:h-52 md:w-52 md:h-52 transform -rotate-90" viewBox="0 0 208 208">
                    <circle
                      cx="104"
                      cy="104"
                      r="96"
                      stroke="currentColor"
                      stroke-width="6"
                      fill="none"
                      class="${isDarkMode ? 'text-slate-700' : 'text-slate-100'}"
                    />
                    <circle
                      cx="104"
                      cy="104"
                      r="96"
                      stroke="currentColor"
                      stroke-width="6"
                      fill="none"
                      stroke-linecap="round"
                      class="${currentState.isWork ? 'text-orange-400' : 'text-teal-400'} transition-all duration-500"
                      stroke-dasharray="${2 * Math.PI * 96}"
                      stroke-dashoffset="${2 * Math.PI * 96 * (1 - progress / 100)}"
                    />
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-[2.75rem] sm:text-[3.25rem] md:text-[3.25rem] font-medium tracking-wider ${textPrimary} leading-none">
                      ${formatTime(currentState.timeLeft)}
                    </span>
                    <span class="text-sm ${textMuted} mt-3">
                      ${currentState.isWork ? '专注中' : '休息中'}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Controls -->
              <div class="flex justify-center gap-2 md:gap-3 flex-wrap">
                <button
                  id="btn-start"
                  class="btn-primary px-6 sm:px-8 py-2.5 md:py-3 rounded-full font-medium text-sm md:text-base ${
                    currentState.isRunning
                      ? 'btn-pause'
                      : 'btn-start'
                  }"
                >
                  ${currentState.isRunning ? '⏸ 暂停' : '▶ 开始'}
                </button>
                <button
                  id="btn-reset"
                  class="btn-secondary px-4 sm:px-6 py-2.5 md:py-3 rounded-full font-medium text-sm md:text-base"
                >
                  ↺ 重置
                </button>
                <button
                  id="btn-skip"
                  class="btn-secondary px-4 sm:px-6 py-2.5 md:py-3 rounded-full font-medium text-sm md:text-base"
                >
                  ⏭ 跳过
                </button>
              </div>

              <!-- Stats -->
              <div class="mt-6 md:mt-8 flex justify-center">
                <div class="stats-badge flex items-center gap-2 px-4 py-2 rounded-full">
                  <span class="text-lg md:text-xl">🍅</span>
                  <span class="text-base md:text-lg font-medium">
                    ${currentState.pomodorosCompleted}
                  </span>
                  <span class="text-sm ${textMuted}">个番茄钟已完成</span>
                </div>
              </div>
            </div>

            <!-- Todo Section -->
            <div class="${cardBg} backdrop-blur-sm rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm border ${borderColor}">
              <div class="flex items-center justify-between mb-4 md:mb-6">
                <h2 class="text-base md:text-lg font-medium ${textSecondary}">📋 今日重点</h2>
                <span class="text-sm ${textMuted}">
                  ${activeTodos}/3 项
                </span>
              </div>

              <!-- Add Todo -->
              <div class="flex gap-2 mb-4 md:mb-6">
                <input
                  type="text"
                  id="todo-input"
                  placeholder="添加新事项..."
                  maxlength="50"
                  value="${escapeHtml(newTodoText)}"
                  class="flex-1 px-3 md:px-4 py-2.5 md:py-3 ${inputBg} ${inputBorder} ${inputText} ${inputPlaceholder} rounded-xl focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-all duration-300 text-sm md:text-base"
                  ${currentTodos.length >= 3 ? 'disabled' : ''}
                />
                <button
                  id="btn-add-todo"
                  class="btn-primary-add px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-medium transition-all duration-300 text-sm md:text-base"
                  ${currentTodos.length >= 3 ? 'disabled' : ''}
                >
                  +
                </button>
              </div>

              <!-- Todo List -->
              <div id="todo-list" class="space-y-2 md:space-y-3 max-h-48 md:max-h-none overflow-y-auto">
                ${currentTodos.length === 0 ? `
                  <div class="text-center py-8 md:py-10 ${isDarkMode ? 'text-slate-500' : 'text-slate-300'}">
                    <div class="text-3xl md:text-4xl mb-2 md:mb-3">✨</div>
                    <p class="font-medium text-sm md:text-base">还没有重点事项</p>
                    <p class="text-xs md:text-sm mt-1">添加 1-3 项今日最重要的事</p>
                  </div>
                ` : currentTodos.map((todo) => `
                  <div
                    class="group flex items-center gap-2 md:gap-3 p-3 md:p-4 ${todoItemBg} rounded-xl border ${todoBorder} ${todoHoverBorder} transition-all duration-300 ${todo.completed ? 'opacity-60' : ''}"
                  >
                    <button
                      class="todo-checkbox flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        todo.completed
                          ? 'bg-teal-400 border-teal-400 text-white'
                          : `${isDarkMode ? 'border-slate-500' : 'border-slate-300'} hover:border-teal-400`
                      }"
                      data-id="${todo.id}"
                    >
                      ${todo.completed ? '✓' : ''}
                    </button>
                    <span class="flex-1 text-sm md:text-base ${todo.completed ? `line-through ${textMuted}` : textSecondary}">
                      ${escapeHtml(todo.text)}
                    </span>
                    <button
                      class="todo-delete opacity-0 group-hover:opacity-100 w-6 h-6 md:w-7 md:h-7 rounded-lg hover:bg-red-50 ${isDarkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-300 hover:text-red-400'} flex items-center justify-center transition-all duration-300"
                      data-id="${todo.id}"
                    >
                      ×
                    </button>
                  </div>
                `).join('')}
              </div>

              ${completedTodos > 0 ? `
                <div class="mt-4 md:mt-6 pt-3 md:pt-4 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'} border-t text-center">
                  <span class="text-sm text-teal-400 font-medium">
                    ✓ 已完成 ${completedTodos} 项
                  </span>
                </div>
              ` : ''}

              <!-- Tip -->
              <div class="mt-4 md:mt-6 p-3 md:p-4 ${tipBg} rounded-xl border ${tipBorder}">
                <div class="flex gap-2 md:gap-3">
                  <span class="text-lg md:text-xl">💡</span>
                  <div class="text-xs md:text-sm ${tipText}">
                    <p class="font-medium ${textSecondary} mb-0.5">小提示</p>
                    <p>完成番茄钟后，起身走动、喝水休息一下，让大脑放松！</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <footer class="mt-6 md:mt-8 text-center ${footerText} text-xs md:text-sm">
            <p>工作 25 分钟 → 休息 5 分钟 → 循环</p>
          </footer>
        </div>
      </div>
    `;

    attachEventListeners();
  }

  function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function attachEventListeners(): void {
    const btnStart = document.getElementById('btn-start');
    const btnReset = document.getElementById('btn-reset');
    const btnSkip = document.getElementById('btn-skip');
    const btnTheme = document.getElementById('btn-theme');
    const todoInput = document.getElementById('todo-input') as HTMLInputElement;
    const btnAddTodo = document.getElementById('btn-add-todo');
    const modeWork = document.getElementById('mode-work');
    const modeBreak = document.getElementById('mode-break');

    btnStart?.addEventListener('click', () => {
      if (currentState.isRunning) {
        timer?.pause();
      } else {
        timer?.start();
      }
    });

    btnReset?.addEventListener('click', () => {
      timer?.reset();
    });

    btnSkip?.addEventListener('click', () => {
      timer?.skip();
    });

    btnTheme?.addEventListener('click', () => {
      toggleTheme();
    });

    modeWork?.addEventListener('click', () => {
      if (!currentState.isWork && !currentState.isRunning) {
        timer?.reset();
      }
    });

    modeBreak?.addEventListener('click', () => {
      if (currentState.isWork && !currentState.isRunning) {
        timer?.skip();
      }
    });

    todoInput?.addEventListener('input', (e) => {
      newTodoText = (e.target as HTMLInputElement).value;
    });

    todoInput?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addTodo();
      }
    });

    btnAddTodo?.addEventListener('click', () => {
      addTodo();
    });

    const todoList = document.getElementById('todo-list');
    todoList?.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.classList.contains('todo-checkbox')) {
        const id = parseInt(target.dataset.id || '0');
        todos?.toggle(id);
      }
      
      if (target.classList.contains('todo-delete')) {
        const id = parseInt(target.dataset.id || '0');
        todos?.remove(id);
      }
    });
  }

  function addTodo(): void {
    const input = document.getElementById('todo-input') as HTMLInputElement;
    const text = input?.value.trim();
    
    if (text) {
      const success = todos?.add(text);
      if (success === false) {
        alert('最多只能添加 3 项重点事项');
      } else {
        input.value = '';
        newTodoText = '';
      }
    }
  }

  function handleTimerUpdate(state: PomodoroState): void {
    currentState = state;
    render();
  }

  function handleTimerComplete(isWork: boolean): void {
    if (isWork) {
      showNotification('🍅 番茄钟完成！', '工作 25 分钟结束，起身休息一下吧！喝杯水，活动一下身体。');
    } else {
      showNotification('☕ 休息结束！', '5 分钟已到，准备好继续专注了吗？');
    }
  }

  function handleTodosUpdate(todoItems: TodoItem[]): void {
    currentTodos = todoItems;
    render();
  }

  timer = new PomodoroTimer(
    25 * 60,
    5 * 60,
    handleTimerUpdate,
    handleTimerComplete
  );
  
  todos = new TodoManager(handleTodosUpdate);
  
  currentState = timer.getState();
  currentTodos = todos.getAll();
  
  render();
}
