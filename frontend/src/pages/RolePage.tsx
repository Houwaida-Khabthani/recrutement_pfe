import { useParams, Link } from "react-router-dom";

const RolePage = () => {
  const { role } = useParams();

  return (
    <div>
      <h2>Espace {role}</h2>

      <Link to={`/login/${role}`}>Login</Link> |{" "}
      <Link to={`/register/${role}`}>Register</Link>
    </div>
  );
};

export default RolePage;
