import SignupForm from "../components/SignUpForm";
export default function Signup() {
  return (
    <div className="hero bg-base-200 flex flex-center min-h-screen min-w-screen justify-center">
      <div className="hero-content flex-col ">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold font-serif flex flex-center justify-center text-pink-500">
            Sign Up
          </h1>
          <p className="py-6 font-serif text-pink-500">
            Create an account to track your fitness journey and stay motivated!
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
