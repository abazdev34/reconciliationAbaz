import { useCallback, useEffect, useState } from 'react'
import { containers, ingredients,countable,onlyCountable } from '../../data/index'


const ContainerWeightCalculator = () => {
	const [id, setId] = useState('')
	const [category, setCategory] = useState('')
	const [weight, setWeight] = useState('')
	const [search, setSearch] = useState([])
	const [categoryCalculations, setCategoryCalculations] = useState({})
	const [currentCategory, setCurrentCategory] = useState('')
	const [results, setResults] = useState([])
	const [error, setError] = useState('')
	const [showSaveButton, setShowSaveButton] = useState(false)
	const [showFinishButton, setShowFinishButton] = useState(false)
	const [isTimerRunning, setIsTimerRunning] = useState(false)
	const [timeElapsed, setTimeElapsed] = useState(0)
	const [lastId, setLastId] = useState(0)
	const [isWeightClicked, setIsWeightClicked] = useState(false)
	const [ingredientsLength, setIngredientsLength] = useState(
		ingredients?.length
	)

	useEffect(() => {
		loadSavedData()
		setIngredientsLength(ingredients?.length)
	}, [ingredients])

	useEffect(() => {
		let timer
		if (isTimerRunning) {
			timer = setInterval(() => {
				setTimeElapsed((prev) => prev + 1)
			}, 1000)
		}
		return () => clearInterval(timer)
	}, [isTimerRunning])

	const loadSavedData = () => {
		try {
			const savedCalculations = JSON.parse(
				localStorage.getItem('savedCalculations') || '{}'
			)
			const savedResults = JSON.parse(
				localStorage.getItem('savedResults') || '[]'
			)
			const savedLastId = parseInt(localStorage.getItem('lastId') || '0')
			setCategoryCalculations(savedCalculations)
			setResults(savedResults)
			setLastId(savedLastId)
			if (Object.keys(savedCalculations).length > 0) {
				setCurrentCategory(Object.keys(savedCalculations)[0])
				setShowSaveButton(true)
				setShowFinishButton(savedResults.length > 0)
			}
		} catch (error) {
			console.error('Error loading saved data:', error)
			setError(
				'Сакталган маалыматтарды жүктөөдө ката кетти. Сураныч, кайра аракет кылыңыз.'
			)
		}
	}

	const generateUniqueCode = () => {
		const letters = 'abcdefghijklmnopqrstuvwxyz'
		const numbers = '0123456789'
		const symbols = '@#$%^&*'

		let code = ''
		for (let i = 0; i < 2; i++) {
			code += letters[Math.floor(Math.random() * letters.length)]
		}
		for (let i = 0; i < 2; i++) {
			code += numbers[Math.floor(Math.random() * numbers.length)]
		}
		for (let i = 0; i < 2; i++) {
			code += symbols[Math.floor(Math.random() * symbols.length)]
		}

		return code
	}

	const handleAddCalculation = () => {
		setError('')
		if (!validateInput()) return

		const existingCalculation = categoryCalculations[currentCategory]?.find(
			(el) => el.id === id
		)

		if (existingCalculation) {
			handleRemoveCalculation(id)
		}

		addCalculation()
		clearInputFields()
		setShowSaveButton(true)
		setIsTimerRunning(true)
	}

	const validateInput = () => {
		if (!currentCategory) {
			setError('Категория тандалган жок. Сураныч, категорияны тандаңыз.')
			return false
		}
		if (!id) {
			setError('ID жазылган жок. Сураныч, ID жазыныз.')
			return false
		}
		if (!Object.prototype.hasOwnProperty.call(containers, id)) {
			setError('Берилген ID табылган жок. Сураныч, туура ID киргизиңиз.')
			return false
		}
		if (!weight) {
			setError('Салмагы киргизилген жок. Сураныч, салмакты киргизиңиз.')
			return false
		}
		if (Number(weight) > 9999) {
			setError('Вы потерялись. Наши весы показывают только до 10 кг.')
			return false
		}
		return true
	}

	const addCalculation = () => {
		const tare = containers[id]
		const newWeight = Number(weight) - tare

		setCategoryCalculations((prev) => ({
			...prev,
			[currentCategory]: [
				...(prev[currentCategory] || []),
				{ id, weight: Number(weight), tare, newWeight },
			],
		}))
	}

	const clearInputFields = () => {
		setId('')
		setWeight('')
	}

	const handleSave = () => {
		setError('')
		if (Object.keys(categoryCalculations).length === 0 || !currentCategory) {
			setError('Сактоо үчүн эсептөөлөр жок. Алгач эсептөөлөрдү кошуңуз.')
			return
		}

		saveCalculations()
		prepareNextCategory()
		setShowFinishButton(true)
	}

	const saveCalculations = () => {
		const categoryTotal = categoryCalculations[currentCategory].reduce(
			(sum, calc) => sum + calc.newWeight,
			0
		)

		setResults((prevResults) => {
			const existingIndex = prevResults.findIndex(
				(item) => item.category === currentCategory
			)

			if (existingIndex !== -1) {
				const updatedResults = [...prevResults]
				updatedResults[existingIndex] = {
					...updatedResults[existingIndex],
					totalWeight: categoryTotal,
				}
				return updatedResults
			} else {
				return [
					...prevResults,
					{ category: currentCategory, totalWeight: categoryTotal },
				]
			}
		})

		try {
			localStorage.setItem(
				'savedCalculations',
				JSON.stringify(categoryCalculations)
			)
			localStorage.setItem('savedResults', JSON.stringify(results))
		} catch (error) {
			console.error('Error saving calculations:', error)
			setError(
				'Эсептөөлөрдү сактоодо ката кетти. Сураныч, кайра аракет кылыңыз.'
			)
		}
	}

	const prepareNextCategory = useCallback(() => {
		setCurrentCategory('')
		setCategory('')
		setCategoryCalculations((prev) => ({ ...prev, ['']: [] }))
	}, [])

	const handleFinish = () => {
		setError('')
		if (results.length === 0) {
			setError('Эсептөөлөр жок. Алгач эсептөөлөрдү кошуп, сактаңыз.')
			return
		}

		finishCalculations()
	}

	const finishCalculations = () => {
		try {
			const finalResults = JSON.parse(localStorage.getItem('results') || '[]')
			const resultsLength = finalResults.length + 1
			const uniqueCode = generateUniqueCode()
			const currentDate = new Date().toLocaleDateString('ru-RU')

			const newResult = {
				id: resultsLength,
				code: uniqueCode,
				date: currentDate,
				categories: results,
			}

			const updatedResults = [...finalResults, newResult]

			localStorage.setItem('results', JSON.stringify(updatedResults))
			alert(
				`Все расчеты завершены и отправлены.ID: ${resultsLength}\nКод: ${uniqueCode}Дата: ${currentDate}`
			)
			setIsTimerRunning(false)
			setLastId(resultsLength)
			resetComponent()
		} catch (error) {
			console.error('Error finishing calculations:', error)
			setError(
				'Эсептөөлөрдү аяктоодо ката кетти. Сураныч, кайра аракет кылыңыз.'
			)
		}
	}

	const resetComponent = () => {
		localStorage.removeItem('savedCalculations')
		localStorage.removeItem('savedResults')
		setCategoryCalculations({})
		setCurrentCategory('')
		setCategory('')
		setResults([])

		setShowSaveButton(false)
		setShowFinishButton(false)
		setIsTimerRunning(false)
		setTimeElapsed(0)
		localStorage.setItem('lastId', lastId.toString())
		window.location.reload()
	}

	const handleInputChange = useCallback(() => {
		return setSearch(
            category
                ? ingredients?.filter((el) => el.toLowerCase().includes(category.toLowerCase())
                ) || countable || onlyCountable
                : []
        )
	}, [category])

	const handleRemoveCalculation = (idToRemove) => {
		setCategoryCalculations((prev) => ({
			...prev,
			[currentCategory]: prev[currentCategory].filter(
				(calc) => calc.id !== idToRemove
			),
		}))
	}

	const handleEditCalculation = (idToEdit) => {
		const calculationToEdit = categoryCalculations[currentCategory].find(
			(calc) => calc.id === idToEdit
		)
		
		if (calculationToEdit) {
			setId(calculationToEdit.id)
			setWeight(calculationToEdit.weight.toString())
			handleRemoveCalculation(idToEdit)
			alert('Эсептөө ийгиликтүү түзөтүлдү')
		}
	}
// кодун визулдык болугу
	return (
		<div className='container'>
			<h2 className='text'>Ингредиенттер</h2>
			<h3>Таймер: {timeElapsed} секунд</h3>

			{error && <p className='error-message'>{error}</p>}
			<div className='space'>
				<p className='tara-input-group'>
					<input
						required
						value={category}
						type='text'
						className='tara-input'
						placeholder=' '
						onChange={(e) => {
							setCategory(e.target.value)
							handleInputChange()
						}}
					/>
					<label className='tara-label'>Ингредиент</label>
					{search.length > 0 && (
						<div className='tara-search-list'>
							{search.map((el, index) => (
								<p
									onClick={() => {
										setCategory(el)
										setCurrentCategory(el)
										setSearch([])
									}}
									key={index}
								>
									{el}
								</p>
							))}
						</div>
					)}
				</p>
				<p className='tara-input-group'>
					<input
						onClick={() => setIsWeightClicked(true)}
						required
						value={weight}
						type='number'
						className='tara-input'
						placeholder=' '
						onChange={(e) => setWeight(e.target.value)}
						max='9999' // Салмакты 9999га чектөө
					/>
					<label className='tara-label'>Весы:</label>
				</p>
				<p className='tara-input-group'>
					<input
						style={{ display: isWeightClicked ? 'block' : 'none' }}
						required
						value={id}
						type='number'
						className='tara-input'
						placeholder=' '
						onChange={(e) => setId(e.target.value)}
					/>
					<label
						style={{ display: isWeightClicked ? 'block' : 'none' }}
						className='tara-label'
					>
						ID: 1 до 25
					</label>
				</p>

				<button
					type='submit'
					onClick={() => {
						handleAddCalculation()
						setIsWeightClicked(false)
					}}
					className='btn'
				>
					Добавить
				</button>
				{showSaveButton && (
					<button
						type='button'
						onClick={() => {
							handleSave()
							setShowSaveButton(false)
						}}
						className='btn1'
					>
						Сохранить 
					</button>
				)}
				{showFinishButton && (
					<button type='button' onClick={handleFinish} className='btn'>
						Отправить
					</button>
				)}
			</div>
			<div className='mt'>
				<h3 className='text'>Текущий счет:</h3>
				{categoryCalculations[currentCategory]?.map((calc, index) => (
					<div key={index} className='calculation-item'>
						<p className='text-sm text-gray-600'>
							{calc.id}: {calc.weight} - {calc.tare} = {calc.newWeight}
						</p>
						<button
							onClick={() => handleEditCalculation(calc.id)}
							className='edit-btn'
						>
							Редактировать
						</button>
						<button
							onClick={() => handleRemoveCalculation(calc.id)}
							className='remove-btn'
						>
							Очистить
						</button>
					</div>
				))}
				<h3 className='text'>Резултат:</h3>
				<table className='results-table'>
					<thead>
						<tr>
							<th>Ингредиент</th>
							<th>Все масса (кг)</th>
						</tr>
					</thead>
					<tbody>
						{results.map((result, index) => (
							<tr key={index}>
								<td>
									{index + 1}.{result.category}
								</td>
								<td>{(result.totalWeight / 1000).toFixed(3)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<p>{ingredientsLength - results.length} ингредиент осталось </p>
			<div className='timer'>
			</div>
			
		</div>
	)
}

export default ContainerWeightCalculator
