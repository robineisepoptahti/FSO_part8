import { useState, useEffect } from "react";
import { LOGIN } from "../queries";
import { useMutation } from "@apollo/client";

const LoginForm = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [login, result] = useMutation(LOGIN, {
    onError: (error) => {
      props.errorMsg("Wrong credentials");
    },
  });

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value;
      props.setToken(token);
      localStorage.setItem("user-token", token);
      window.location.reload();
    }
  }, [result.data]);

  const submit = async () => {
    console.log(username);
    await login({ variables: { username, password } });
    setUsername("");
    setPassword("");
  };

  if (!props.show) {
    return null;
  }
  return (
    <div>
      <input onChange={({ target }) => setUsername(target.value)} />
      <br />
      <input
        type="password"
        onChange={({ target }) => setPassword(target.value)}
      />
      <button onClick={submit}>Submit</button>
    </div>
  );
};

export default LoginForm;
