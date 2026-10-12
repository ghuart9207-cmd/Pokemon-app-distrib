import { ImageBackground, Pressable, Text } from 'react-native';

import { PokemonBoardCard } from '@/features/game/components/cards/pokemon-board-card';
import type { BoardState, PokemonInPlay } from '@/features/game/types';
import { styles } from './pokemon-board.styles';

const rows = ['A', 'B', 'C', 'D'];

const columns = [1, 2, 3, 4];

const rowPositions: Record<string, `${number}%`> = {
  A: '2.3%',
  B: '25.9%',
  C: '56.2%',
  D: '79.2%',
};

const columnPositions: Record<string, `${number}%`> = {
  '1': '10.5%',
  '2': '31.2%',
  '3': '51.5%',
  '4': '72.2%',
};

type PokemonBoardProps = {
  board: BoardState;
  selectedCell: string | null;
  onCellPress: (cellName: string) => void;
  onToolPress: (cellName: string, pokemon: PokemonInPlay) => void;
};

export function PokemonBoard({
  board,
  selectedCell,
  onCellPress,
  onToolPress,
}: PokemonBoardProps) {
  return (
    <ImageBackground
      source={require('../../../../../assets/images/plateau-pokemon.png')}
      style={styles.boardBackground}
      resizeMode="stretch"
    >
      {rows.map((row) =>
        columns.map((column) => {
          const cellName = `${row}${column}`;
          const pokemon = board[cellName];

          return (
            <Pressable
              key={cellName}
              onPress={() => onCellPress(cellName)}
              style={[
                styles.boardImageCell,
                {
                  top: rowPositions[row],
                  left: columnPositions[String(column)],
                },
                selectedCell === cellName && styles.selectedImageCell,
              ]}
            >
              {!pokemon && <Text style={styles.imageCellLabel}>{cellName}</Text>}
              {pokemon && (
                <PokemonBoardCard
                  pokemon={pokemon}
                  onToolPress={() => onToolPress(cellName, pokemon)}
                />
              )}
            </Pressable>
          );
        })
      )}
    </ImageBackground>
  );
}
