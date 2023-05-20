import {ApiProperty} from "@nestjs/swagger"
export class CastVoteDto {
  @ApiProperty()
  readonly proposal: string;
}