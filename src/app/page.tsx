import Login from "./components/Login";
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100">
      <h2 className="text-4xl font-extrabold text-center text-pink-500">
        Fitness StatTrack
      </h2>
      <Login />
    </div>
  );
}
