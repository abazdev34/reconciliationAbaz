import  { useState, useEffect } from 'react';


const Results = ({ onDelete }) => {
    const [results, setResults] = useState([]);

    useEffect(() => {
        const storedResults = JSON.parse(localStorage.getItem('results') || '[]');
        setResults(storedResults);
    }, []);

    const deleteResults = () => {
        localStorage.removeItem('results');
        setResults([]);
        if (onDelete) onDelete();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    };

    return (
        <div className='tara-results'>
            <button onClick={deleteResults} className='btn'>Очистить</button>
            <h3 className='text'>Результаты расчетов:</h3>
            <table className='results-table'>
                <thead>
                    <tr className='tara-result'>
                        <th>Ингредиенты</th>
                        <th>Вес (кг)</th>
                        <th>Дата</th>
                        <th>ID</th> {/* New column for ID */}
                        <th>Код</th> {/* New column for Code Date */}
                    </tr>
                </thead>
                <tbody>
                    {results.flatMap((result, resultIndex) =>
                        result.categories.map((category, categoryIndex) => (
                            <tr className='tara-result' key={`${resultIndex}${categoryIndex}`}>                
                                <td>{category.category}</td>
                                <td>{(category.totalWeight / 1000).toFixed(3)} кг</td>
                                <td>{formatDate(result.date)}</td>
                                <td>{result.id}</td> {/* Displaying ID */}
                                <td>{result.code}</td> {/* Displaying Code Date */}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Results;