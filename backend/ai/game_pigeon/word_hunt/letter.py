class Letter(object):
	"""
	Class that represents each single character letter piece on the board.
	Attributes:
		char (str): The character represented by this letter.
		pos (int): The position of the letter in the board.
		visited (bool): Indicates whether this letter has been visited during the search.
	"""
	def __init__(self, ch: str, index: int, visit: bool=False):
		self.char = ch
		self.pos = index
		self.visited = visit
	
	def copyLetter(self) -> 'Letter':
		"""
		Creates a copy of this letter with the same character, position, and visited status.
		Returns:
			Letter: A new Letter object with the same attributes.
		"""
		return Letter(self.char, self.pos, self.visited)
	
	def markVisited(self):
		"""
		Marks this letter as visited.
		"""
		self.visited = True
