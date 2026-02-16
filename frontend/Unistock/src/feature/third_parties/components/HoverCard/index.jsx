const HoverCard = ({ children, content }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute hidden group-hover:block bg-white shadow p-2 rounded">
        {content}
      </div>
    </div>
  );
};

export default HoverCard;
