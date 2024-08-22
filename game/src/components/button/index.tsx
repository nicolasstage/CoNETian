import styled from "styled-components";
import { ReactNode } from "react";
import { FlexDiv } from "../div";

export const Button = styled.button<{
  $margin?: string;
  $padding?: string;
  $border?: string;
  $fontSize?: string;
  $color?: string;
  $background?: string;
  $width?: string;
  $height?: string;
  $radius?: string;
}>`
  margin: ${(props) => props.$margin || 0};
  padding: ${(props) => props.$padding || 0};
  border: ${(props) => props.$border || 0};
  font-size: ${(props) => props.$fontSize || "1rem"};
  color: ${(props) => props.$color || "white"};
  background-color: ${(props) => props.$background || "unset"};
  width: ${(props) => props.$width};
  height: ${(props) => props.$height};
  border-radius: ${(props) => props.$radius};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
`;

const GradientImage = styled(FlexDiv)`
  background-image: linear-gradient(
    45deg,
    #026d74 0%,
    #79f8ff 25%,
    #61c6cc 50%,
    #04dae8 75%
  );
  padding: 1px;
  border-radius: 32px;
`;

type GradientButtonProps = {
  children: ReactNode;
  width?: string;
};

export const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  width,
}) => {
  return (
    <GradientImage>
      <Button
        $background="#252527"
        $padding="16px 24px"
        $radius="32px"
        $fontSize="14px"
        $width={width}
      >
        {children}
      </Button>
    </GradientImage>
  );
};
