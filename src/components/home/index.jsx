
import { ingredients } from '../../data/index'; // Adjust the path as necessary

const Home = () => {
    return (
        <div>
            <h2>Список ингредиентов</h2>
            <ul>
                {ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                ))}
            </ul>
        </div>
    );
};

export default Home;