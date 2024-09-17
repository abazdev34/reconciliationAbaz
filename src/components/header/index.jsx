import { NavLink } from 'react-router-dom'
import './header.scss'
const Header = () => {
	return (
		<div id='header'>
			<div className="header">
				<div className="header__logo">
					<div className="nav">
						<NavLink to='/'>Главная</NavLink>
						<NavLink to='/Results'>Результаты</NavLink>
						<NavLink to='/ContainerWeightCalculator'>Калькулятор</NavLink>

					</div>
				</div>
			</div>
			
		</div>
	);
};

export default Header;