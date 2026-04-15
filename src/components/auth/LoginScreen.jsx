import { useState } from "react";
import { User, Users } from "lucide-react";
import { auth, db } from "../../firebase"; // Importing Firebase
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
    setEmail('');
    setPassword('');
    if (!loginMode) {
      setName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (isLogin) {
        // 🔐 FIREBASE LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 📝 FIREBASE SIGNUP
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 1. Create a user profile document in Firestore to store their Role and Name
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
          role: role
        });

        // 2. If it's a student, initialize a blank scorecard in the 'students' collection
        if (role === 'student') {
          await setDoc(doc(db, 'students', user.uid), {
            name: name,
            email: email,
            roll: "NEW" + Math.floor(Math.random() * 1000),
            class: "Unassigned", // Will be updated by teacher
            section: "A",
            currentSem: 1,
            cgpa: 0,
            semesters: [{ sem: 1, subjects: {}, sgpa: 0 }]
          });
        }
      }
    } catch (err) {
      // Clean up Firebase error messages for the user
      let errorMessage = err.message;
      if (err.code === 'auth/invalid-credential') errorMessage = 'Invalid email or password.';
      if (err.code === 'auth/email-already-in-use') errorMessage = 'An account with this email already exists.';
      if (err.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]">
      <div className="bg-white p-8 sm:p-10 border border-gray-200 shadow-xl max-w-md w-full rounded-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#003366]"></div>
        <div className="text-center mb-8 mt-2">
          <img src="https://saraladmission.com/wp-content/uploads/2025/05/Jagannath-Institute-of-Management-Sciences-JIMS-Rohini-LOGO.png" alt="jims logo" className="mx-auto mb-4 h-16 object-contain" />
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Result Analysis System</h1>
          <p className="text-sm text-gray-500 mt-1.5 font-medium">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 text-center font-medium">
            {error}
          </div>
        )}

        <div className="flex mb-6 bg-gray-100 p-1 rounded-md">
          <button 
            type="button"
            onClick={() => toggleMode(true)} 
            className={`flex-1 py-2 text-sm font-semibold rounded transition-all ${isLogin ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Login
          </button>
          <button 
            type="button"
            onClick={() => toggleMode(false)} 
            className={`flex-1 py-2 text-sm font-semibold rounded transition-all ${!isLogin ? 'bg-white text-[#003366] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button 
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${role === 'student' ? 'border-[#003366] bg-blue-50 text-[#003366]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <User className="w-4 h-4" /> Student
            </button>
            <button 
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg border flex items-center justify-center gap-2 transition-all ${role === 'teacher' ? 'border-[#003366] bg-blue-50 text-[#003366]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <Users className="w-4 h-4" /> Faculty
            </button>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Full Name</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none transition-shadow"
                placeholder="e.g. John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none transition-shadow"
              placeholder="you@university.edu"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none transition-shadow"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-3 mt-6 bg-[#003366] text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-all shadow-md"
          >
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;