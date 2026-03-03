import React, { useState } from 'react';

interface DropdownProps {
  options: string[];
  onSelect: (option: string) => void;
  placeholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({ options, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={toggleDropdown} className="border p-2 rounded">
        {selectedOption || placeholder || 'Select an option'}
      </button>
      {isOpen && (
        <ul className="absolute bg-white border rounded shadow mt-1">
          {options.map((option) => (
            <li
              key={option}
              onClick={() => handleOptionClick(option)}
              className="p-2 hover:bg-gray-200 cursor-pointer"
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;