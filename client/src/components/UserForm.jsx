import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import { ethers } from "ethers";
import usdcAbi from "../abis/USDCABI.json"
import abi from "../abis/Health_Contract.json"

const UserForm = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const [showDescriptions, setShowDescriptions] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [chainId, setChainId] = useState(null);
  
  const tests = [
    { id: 1, name: "Haemoglobin Test", description: "Test Haemoglobin in your blood. Price: 0.5 USD", price: ethers.parseUnits("0.5", 18) },
    { id: 2, name: "Blood Sugar Test", description: "Test your Blood Sugar . Price: 0.75 USD", price: ethers.parseUnits("0.75", 18) },
    { id: 3, name: "Blood Uria Test", description: "Test the Uria content in your blood. Price: 1.25 USD", price: ethers.parseUnits("1.25", 18) },
    { id: 4, name: "Serum Bilirubin Test", description: "Test Serum Bilirubin in your blood. Price: 2.0 USD", price: ethers.parseUnits("2.0", 18) },
    { id: 5, name: "HDL Cholestrol Test", description: "Test your HDL Cholestrol. Price: 1.75 USD", price: ethers.parseUnits("1.75", 18) },
    { id: 6, name: "FDL Cholestrol Test", description: "Test your FDL Cholestrol. Price: 2 USD", price: ethers.parseUnits("2", 18) }
  ];

  useEffect(() => {
    const fetchChainId = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setChainId(network.chainId);
      }
    };
    fetchChainId();
  }, [provider]);

  const toggleDescription = (id) => {
    if (showDescriptions.includes(id)) {
      setShowDescriptions(showDescriptions.filter(testId => testId !== id));
    } else {
      setShowDescriptions([...showDescriptions, id]);
    }
  };

  const handleTestSelection = (id) => {
    if (selectedTests.includes(id)) {
      setSelectedTests(selectedTests.filter(testId => testId !== id));
    } else {
      setSelectedTests([...selectedTests, id]);
    }
  };

  const handleSubmit = async (event) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractAddress = import.meta.env.VITE_HEALTH_CONTRACT;
    const contractABI = abi;
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    event.preventDefault();
    if (!contract) {
      alert("Smart contract is not loaded.");
      return;
    }
    const DESTINATION_CHAIN_ID = "14767482510784806043";
    const selectedTestPrices = selectedTests.map(testId => tests.find(test => test.id === testId).price);
    const totalPrice = selectedTestPrices.reduce((total, price) => total.add(price), ethers.BigNumber.from(0));
    const USDC_CONTRACT_ADDRESS = import.meta.env.VITE_USDC;
    try {
      const usdcContract = new ethers.Contract(
        USDC_CONTRACT_ADDRESS, 
        usdcAbi, 
        provider.getSigner()
      );

      if (chainId === DESTINATION_CHAIN_ID) { 
        const approveTx = await usdcContract.approve(contract.address, totalPrice);
        await approveTx.wait();
        const tx = await contract.selectTests(selectedTests);
        await tx.wait();
        alert("Tests selected successfully!");
      } else {
        const USDC_CONTRACT_ADDRESS1 = "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
        const usdcContract1 = new ethers.Contract(
          USDC_CONTRACT_ADDRESS1, 
          usdcAbi, 
          provider.getSigner()
        );
        const senderContract = new ethers.Contract(
          SENDER_CONTRACT_ADDRESS, 
          senderAbi,
          provider.getSigner()
        );
        const transferTx = await usdcContract1.transfer(senderContract.address, totalPrice);
        await transferTx.wait();
        const tx = await senderContract.sendMessagePayLINK(
          DESTINATION_CHAIN_SELECTOR,
          account,
          selectedTests,
          totalPrice
        );
        await tx.wait();
        alert("Tests selected and message sent successfully!");
      }
    } catch (error) {
      console.error("Error selecting tests:", error);
      alert("Error selecting tests.");
    }
  };

  return (
    <div className="w-full md:w-2/3 p-4">
      <h2 className="text-2xl font-semibold mb-4">Select Tests</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {tests.map(test => (
          <div key={test.id} className="border p-4 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <input
                  type="checkbox"
                  id={`test-${test.id}`}
                  className="mr-2"
                  onChange={() => handleTestSelection(test.id)}
                />
                <label
                  htmlFor={`test-${test.id}`}
                  className="cursor-pointer"
                >
                  {test.name}
                </label>
              </div>
              <button
                type="button"
                className="ml-4 text-blue-500 hover:text-blue-700"
                onClick={() => toggleDescription(test.id)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"></path>
                </svg>
              </button>
            </div>
            {showDescriptions.includes(test.id) && (
              <div className="mt-2 p-2 bg-gray-100 rounded shadow text-black">
                {test.description}
              </div>
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default UserForm;
