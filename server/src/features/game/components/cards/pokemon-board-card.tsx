import { Image, Pressable, Text, View } from 'react-native';

import { getPokemonMaxHp } from '@/features/game/rules';
import type { PokemonInPlay } from '@/features/game/types';
import {
  formatAttackCost,
  formatEnergies,
  getStageName,
  getTypeIcon,
} from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { getTypeCardColors } from './card-colors';
import { styles } from './pokemon-board-card.styles';

type PokemonBoardCardProps = {
  pokemon: PokemonInPlay;
  onToolPress?: () => void;
};

export function PokemonBoardCard({ pokemon, onToolPress }: PokemonBoardCardProps) {
  const effectiveMaxHp = getPokemonMaxHp(pokemon);
  const hpPercent = Math.max(
    0,
    Math.min(100, (pokemon.currentHp / effectiveMaxHp) * 100)
  );
  const hpWidth = `${hpPercent}%` as `${number}%`;
  const colors = getTypeCardColors(pokemon.card.type);
  const statusIcons = [
    pokemon.poisoned ? '☠️' : '',
    pokemon.burned ? '🔥' : '',
    pokemon.paralyzed ? '⚡' : '',
    pokemon.confused ? '🌀' : '',
    pokemon.asleep ? '😴' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View
      style={[
        sharedStyles.miniPokemonCard,
        {
          backgroundColor: colors.card,
          borderColor: pokemon.card.variant === 'gx' ? '#C0C0C0' : colors.border,
        },
      ]}
    >
      {pokemon.attachedTool && (
        <Pressable
          style={styles.attachedToolThumbnail}
          onPress={(event) => {
            event.stopPropagation();
            onToolPress?.();
          }}
        >
          {pokemon.attachedTool.artwork ? (
            <Image
              source={pokemon.attachedTool.artwork}
              style={styles.attachedToolThumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.attachedToolThumbnailFallback}>🛠</Text>
          )}
        </Pressable>
      )}

      <View style={[sharedStyles.miniCardHeader, { backgroundColor: colors.header }]}>
        <View style={sharedStyles.miniCardHeaderLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={sharedStyles.miniCardStageBadge}>
              {getStageName(pokemon.card.stage)}
            </Text>
            {/* Petit symbole pour repérer les Invocations */}
            {pokemon.isInvocation && (
              <Text
                style={sharedStyles.miniCardInvocationBadge}
                accessibilityLabel="Invocation"
              >
                ✨
              </Text>
            )}
          </View>
          <View style={sharedStyles.miniCardNameRow}>
            <Text style={sharedStyles.miniCardName} numberOfLines={1}>
              {pokemon.card.variant === 'gx'
                ? pokemon.card.name.replace(/\s*-?\s*gx$/i, '')
                : pokemon.card.name}
            </Text>
            {pokemon.card.variant === 'gx' && (
              <Text style={sharedStyles.gxNameText}> GX</Text>
            )}
          </View>
        </View>

        <View style={sharedStyles.headerHpBar}>
          <View style={[sharedStyles.headerHpBarFill, { width: hpWidth }]} />
          <Text style={sharedStyles.headerHpText}>
            {pokemon.currentHp}/{effectiveMaxHp} PV
          </Text>
        </View>
      </View>

      <View style={sharedStyles.miniCardArtwork}>
        {pokemon.card.artwork ? (
          <Image
            source={pokemon.card.artwork}
            style={sharedStyles.miniCardArtworkImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <Text style={sharedStyles.miniCardTypeIcon}>
              {getTypeIcon(pokemon.card.type)}
            </Text>
            <Text style={sharedStyles.miniCardArtworkName}>{pokemon.card.name}</Text>
          </>
        )}
      </View>

      <View style={[sharedStyles.miniCardAttacks, { backgroundColor: colors.attackBg }]}>
        <Text style={sharedStyles.attackTypeWatermark}>
          {getTypeIcon(pokemon.card.type)}
        </Text>

        {pokemon.card.talent && (
          <View style={sharedStyles.miniAttackBlock}>
            <View style={sharedStyles.miniAttackRow}>
              <Text style={[sharedStyles.miniAttackName, { color: '#d71920' }]}>
                Talent : {pokemon.card.talent.name}
              </Text>
            </View>
            <Text style={sharedStyles.miniAttackEffect}>
              {pokemon.card.talent.description}
            </Text>
          </View>
        )}

        {pokemon.card.attacks.map((attack, index) => (
          <View key={`${attack.name}-${index}`} style={sharedStyles.miniAttackBlock}>
            <View style={sharedStyles.miniAttackRow}>
              <Text style={sharedStyles.miniAttackName} numberOfLines={1}>
                {formatAttackCost(attack)} {attack.name}
              </Text>
              <Text style={sharedStyles.miniAttackDamage}>{attack.damage}</Text>
            </View>
            {attack.effectText && (
              <Text style={sharedStyles.miniAttackEffect}>{attack.effectText}</Text>
            )}
          </View>
        ))}
      </View>

      <View style={sharedStyles.miniCardBottom}>
        <Text style={sharedStyles.miniCardEnergy}>
          Énergies : {formatEnergies(pokemon.energies) || '—'}
        </Text>
        <Text style={sharedStyles.miniCardRetreat}>
          Retraite : ◇{pokemon.card.retreatCost}
        </Text>
      </View>

      {statusIcons.length > 0 && (
        <Text style={styles.miniCardStatuses}>{statusIcons}</Text>
      )}
      {pokemon.hasAttacked && (
        <Text style={styles.miniCardAttacked}>✓ Attaque faite</Text>
      )}
    </View>
  );
}
