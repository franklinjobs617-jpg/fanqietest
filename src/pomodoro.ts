export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface PomodoroState {
  timeLeft: number;
  isRunning: boolean;
  isWork: boolean;
  workDuration: number;
  breakDuration: number;
  pomodorosCompleted: number;
}

export class PomodoroTimer {
  private state: PomodoroState;
  private intervalId: number | null = null;
  private onUpdate: (state: PomodoroState) => void;
  private onComplete: (isWork: boolean) => void;

  constructor(
    workDuration: number = 25 * 60,
    breakDuration: number = 5 * 60,
    onUpdate: (state: PomodoroState) => void,
    onComplete: (isWork: boolean) => void
  ) {
    this.state = {
      timeLeft: workDuration,
      isRunning: false,
      isWork: true,
      workDuration,
      breakDuration,
      pomodorosCompleted: 0,
    };
    this.onUpdate = onUpdate;
    this.onComplete = onComplete;
  }

  start(): void {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    this.intervalId = window.setInterval(() => this.tick(), 1000);
    this.onUpdate({ ...this.state });
  }

  pause(): void {
    if (!this.state.isRunning) return;
    
    this.state.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.onUpdate({ ...this.state });
  }

  reset(): void {
    this.pause();
    this.state.timeLeft = this.state.isWork 
      ? this.state.workDuration 
      : this.state.breakDuration;
    this.onUpdate({ ...this.state });
  }

  skip(): void {
    this.pause();
    this.onComplete(this.state.isWork);
    this.toggleMode();
  }

  private tick(): void {
    if (this.state.timeLeft > 0) {
      this.state.timeLeft--;
      this.onUpdate({ ...this.state });
    } else {
      this.pause();
      this.onComplete(this.state.isWork);
      this.toggleMode();
    }
  }

  private toggleMode(): void {
    if (this.state.isWork) {
      this.state.pomodorosCompleted++;
      this.state.isWork = false;
      this.state.timeLeft = this.state.breakDuration;
    } else {
      this.state.isWork = true;
      this.state.timeLeft = this.state.workDuration;
    }
    this.onUpdate({ ...this.state });
  }

  getState(): PomodoroState {
    return { ...this.state };
  }

  destroy(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
  }
}

export class TodoManager {
  private todos: TodoItem[] = [];
  private maxItems: number = 3;
  private onUpdate: (todos: TodoItem[]) => void;

  constructor(onUpdate: (todos: TodoItem[]) => void) {
    this.onUpdate = onUpdate;
    this.load();
  }

  add(text: string): boolean {
    if (this.todos.length >= this.maxItems) {
      return false;
    }
    const todo: TodoItem = {
      id: Date.now(),
      text,
      completed: false,
    };
    this.todos.push(todo);
    this.save();
    this.onUpdate([...this.todos]);
    return true;
  }

  remove(id: number): void {
    this.todos = this.todos.filter((t) => t.id !== id);
    this.save();
    this.onUpdate([...this.todos]);
  }

  toggle(id: number): void {
    this.todos = this.todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    this.save();
    this.onUpdate([...this.todos]);
  }

  getAll(): TodoItem[] {
    return [...this.todos];
  }

  private save(): void {
    try {
      localStorage.setItem('pomodoro-todos', JSON.stringify(this.todos));
    } catch (e) {
      console.error('Failed to save todos:', e);
    }
  }

  private load(): void {
    try {
      const data = localStorage.getItem('pomodoro-todos');
      if (data) {
        this.todos = JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load todos:', e);
      this.todos = [];
    }
  }
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false);
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then((permission) => {
      return permission === 'granted';
    });
  }
  
  return Promise.resolve(false);
}

export function showNotification(title: string, body: string): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '🍅',
      badge: '🍅',
      tag: 'pomodoro',
      requireInteraction: true,
    });
  }
}
