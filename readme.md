# use-time-machine ⏳

A zero-dependency, ultra-lightweight React hook for Gmail-style optimistic UI and undo actions.

Adding delayed, cancellable actions to a React app usually requires messy `setTimeout` cleanup, state management, and complex promise handling. `use-time-machine` abstracts all of that into a single, perfectly typed hook with an optional beautiful UI toast.

## ✨ Features
- **⚡️ Zero Dependencies:** Microscopic bundle size.
- **🔄 Optimistic UI:** Update your UI instantly, before the server even responds.
- **🛡️ Auto-Revert:** If the server fails or the user clicks "Undo", the UI reverts automatically.
- **🎨 Headless or Styled:** Use the pure logic engine, or drop in our beautiful out-of-the-box Toast component.

## 📦 Installation

```bash
npm install use-time-machine
```

## 🚀 Quick Start (With Included UI)
Drop the hook and the TimeMachineToast into any component to instantly add cancellable actions.

```
import { useState } from 'react';
import { useTimeMachine, TimeMachineToast } from 'use-time-machine';

export default function App() {
  const [users, setUsers] = useState([{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }]);

  const { execute, undo, isPending, timeLeft } = useTimeMachine({
    mutationFn: async (userId) => {
      // Your actual API call happens here (after the delay)
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    },
    onOptimistic: (userId) => {
      // Fires INSTANTLY: Hide the user from the UI immediately
      setUsers(prev => prev.filter(u => u.id !== userId));
    },
    onRevert: (userId) => {
      // Fires if they click 'Undo' OR if the API call fails
      alert('Action cancelled! User restored.'); 
    },
    delayMs: 5000, // 5 seconds to change their mind
  });

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          {user.name} 
          <button onClick={() => execute(user.id)}>Delete</button>
        </div>
      ))}

      {/* The beautiful shrinking progress bar toast */}
      <TimeMachineToast 
        isPending={isPending} 
        timeLeft={timeLeft} 
        undo={undo} 
        message="User deleted." 
      />
    </div>
  );
}

```

## 🎨 Advanced Customization
Because use-time-machine is built with a Headless architecture, you have complete control over how the UI looks.

### Option 1: Style the included toast with Tailwind CSS
You can easily override our default inline styles by passing a className or style prop to the TimeMachineToast.

```
<TimeMachineToast 
  isPending={isPending} 
  timeLeft={timeLeft} 
  undo={undo} 
  message="File moved to trash."
  // Completely overrides the look using Tailwind!
  className="bg-slate-900 border border-slate-700 text-white shadow-2xl rounded-xl"
/>

```

### Option 2: Build a completely custom UI (Headless Mode)
If you are using a library like Shadcn, Material UI, or just want to build your own component, you can ignore our Toast completely. Just use the states returned from the hook!

```
import { useTimeMachine } from 'use-time-machine';

export default function CustomApp() {
  const { execute, undo, isPending, timeLeft } = useTimeMachine({
    mutationFn: deleteProject,
    delayMs: 10000 
  });

  return (
    <div>
      <button onClick={execute}>Delete Project</button>

      {/* RENDER YOUR OWN CUSTOM HTML/COMPONENTS */}
      {isPending && (
        <div className="fixed top-5 right-5 bg-red-500 p-4 rounded-lg flex items-center gap-4">
          <p className="text-white font-bold">
            Project deleting in {Math.ceil(timeLeft / 1000)} seconds...
          </p>
          
          <button onClick={undo} className="bg-white text-red-500 px-3 py-1 rounded">
            STOP!
          </button>
        </div>
      )}
    </div>
  );
}

```

## ⚙️ Configuration Options

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `mutationFn` | `(vars: T) => Promise<any>` | **Yes** | The async API call to execute after the delay. |
| `onOptimistic`| `(vars: T) => void` | No | Fires immediately when `execute()` is called. |
| `onRevert` | `(vars: T) => void` | No | Fires if `undo()` is clicked or `mutationFn` throws an error. |
| `onSuccess` | `(data, vars) => void` | No | Fires after `mutationFn` successfully completes. |
| `delayMs` | `number` | No | Countdown time in milliseconds. Default: `5000`. |

## 📜 License
MIT