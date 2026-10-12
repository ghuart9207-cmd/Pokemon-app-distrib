import { Image, Text, View } from 'react-native';

import type { PokemonCard } from '@/features/game/types';
import {
  formatAttackCost,
  getStageName,
  getTypeIcon,
} from '@/features/game/utils/card-labels';
import { sharedStyles } from '@/features/game/styles/shared-styles';
import { getTypeCardColors } from './card-colors';

type PokemonHandCardProps = {
  card: PokemonCard;
};

export function PokemonHandCard({ card }: PokemonHandCardProps) {
  const colors = getTypeCardColors(card.type);
  const hpWidth = '100%' as `${number}%`;

  return (
    <View
      style={[
        sharedStyles.miniPokemonCard,
        {
          backgroundColor: colors.card,
          borderColor: card.variant === 'gx' ? '#C0C0C0' : colors.border,
        },
      ]}
    >
      <View style={[sharedStyles.miniCardHeader, { backgroundColor: colors.header }]}>
        <View style={sharedStyles.miniCardHeaderLeft}>
          <Text style={sharedStyles.miniCardStageBadge}>{getStageName(card.stage)}</Text>
          <View style={sharedStyles.miniCardNameRow}>
            <Text style={sharedStyles.miniCardName} numberOfLines={1}>
              {card.variant === 'gx' ? card.name.replace(/\s*-?\s*gx$/i, '') : card.name}
            </Text>
            {card.variant === 'gx' && <Text style={sharedStyles.gxNameText}> GX</Text>}
          </View>
        </View>

        <View style={sharedStyles.headerHpBar}>
          <View style={[sharedStyles.headerHpBarFill, { width: hpWidth }]} />
          <Text style={sharedStyles.headerHpText}>
            {card.maxHp}/{card.maxHp} PV
          </Text>
        </View>
      </View>

      <View style={sharedStyles.miniCardArtwork}>
        {card.artwork ? (
          <Image
            source={card.artwork}
            style={sharedStyles.miniCardArtworkImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <Text style={sharedStyles.miniCardTypeIcon}>{getTypeIcon(card.type)}</Text>
            <Text style={sharedStyles.miniCardArtworkName}>{card.name}</Text>
          </>
        )}
      </View>

      <View style={[sharedStyles.miniCardAttacks, { backgroundColor: colors.attackBg }]}>
        <Text style={sharedStyles.attackTypeWatermark}>{getTypeIcon(card.type)}</Text>

        {card.talent && (
          <View style={sharedStyles.miniAttackBlock}>
            <View style={sharedStyles.miniAttackRow}>
              <Text style={[sharedStyles.miniAttackName, { color: '#d71920' }]}>
                Talent : {card.talent.name}
              </Text>
            </View>
            <Text style={sharedStyles.miniAttackEffect}>{card.talent.description}</Text>
          </View>
        )}

        {card.attacks.map((attack, index) => (
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
        <Text style={sharedStyles.miniCardEnergy}>Type : {getTypeIcon(card.type)}</Text>
        <Text style={sharedStyles.miniCardRetreat}>Retraite : ◇{card.retreatCost}</Text>
      </View>
    </View>
  );
}
