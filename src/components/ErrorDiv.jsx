import PropTypes from "prop-types";

const ErrorDiv = ({
  text = "Something went wrong. Please try again later.",
}) => {
  return (
    <div className="max-w-[95%] px-8 h-40 py-3 border-2 rounded-lg shadow-lg w-fit flex items-center justify-center">
      {text}
    </div>
  );
};

ErrorDiv.propTypes = {
  text: PropTypes.string,
};

export default ErrorDiv;