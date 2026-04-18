import { useState } from "react";
import { User, ShieldCheck } from "lucide-react";
import { auth, db } from "../../firebase"; 
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const LoginScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');

  const toggleMode = (loginMode) => {
    setIsLogin(loginMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
          role: role // 'admin' or 'student'
        });

        if (role === 'student') {
          await setDoc(doc(db, 'students', user.uid), {
            name: name, email: email, roll: "NEW", class: "Unassigned", section: "A", currentSem: 1, cgpa: 0, semesters: []
          });
        }
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 sm:p-10 border border-gray-200 shadow-xl max-w-md w-full rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-[#003366]">Result Analysis System</h1>
        
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 text-center">{error}</div>}

        <div className="flex mb-6 bg-gray-100 p-1 rounded-md">
          <button onClick={() => toggleMode(true)} className={`flex-1 py-2 text-sm font-semibold rounded ${isLogin ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-500'}`}>Login</button>
          <button onClick={() => toggleMode(false)} className={`flex-1 py-2 text-sm font-semibold rounded ${!isLogin ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-500'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button type="button" onClick={() => setRole('student')} className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 ${role === 'student' ? 'border-[#003366] bg-blue-50 text-[#003366]' : 'text-gray-500'}`}><User className="w-4 h-4" /> Student</button>
            <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 ${role === 'admin' ? 'border-[#003366] bg-blue-50 text-[#003366]' : 'text-gray-500'}`}><ShieldCheck className="w-4 h-4" /> Admin</button>
          </div>

          {!isLogin && (
             <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-1 outline-none" placeholder="Full Name" required />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-1 outline-none" placeholder="Email Address" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded focus:ring-1 outline-none" placeholder="Password" required />

          <button type="submit" className="w-full py-3 mt-4 bg-[#003366] text-white font-semibold rounded-lg hover:bg-blue-900 transition-all">{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
      </div>
    </div>
  );
};
export default LoginScreen;