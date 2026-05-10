import { Test, TestingModule } from "@nestjs/testing";
import { DisputeService } from "./dispute.service";
import { DisputeRepository } from "../repository/dispute.repository";
import { DisputeType } from "../enum/dispute-type.enum";
import { DisputeStatus } from "../enum/dispute-status.enum";
import { Dispute, TimelineEntry } from "../entity/dispute.entity";
import { DomainError } from "../../common/error/domain.error";

describe("DisputeService", () => {
  let service: DisputeService;
  let repository: jest.Mocked<DisputeRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        {
          provide: DisputeRepository,
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            addTimelineEntry: jest.fn(),
            getOperatorWorkloads: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
    repository = module.get(DisputeRepository);
  });

  describe("createDispute", () => {
    it("새로운 분쟁을 성공적으로 생성한다", async () => {
      const input = {
        type: DisputeType.TYPO,
        requestId: "REQ-123",
        requesterId: BigInt(1),
      };

      repository.create.mockResolvedValue(
        new Dispute(
          "DSP-2026-0001",
          DisputeStatus.RECEIVED,
          input.type,
          input.requestId,
          input.requesterId,
          null,
          new Date(),
          false,
          new Date(),
          new Date(),
        ),
      );

      const result = await service.createDispute(input);

      expect(result.id).toContain("DSP-2026-");
      expect(result.status).toBe(DisputeStatus.RECEIVED);
      expect(repository.create).toHaveBeenCalled();
      expect(repository.addTimelineEntry).toHaveBeenCalled();
    });
  });

  describe("assignOperator", () => {
    it("가장 부하가 적은 운영자에게 배정한다", async () => {
      const disputeId = "DSP-2026-0001";
      const dispute = new Dispute(
        disputeId,
        DisputeStatus.RECEIVED,
        DisputeType.TYPO,
        "REQ-123",
        BigInt(1),
        null,
        new Date(),
        false,
        new Date(),
        new Date(),
      );

      repository.findById.mockResolvedValue(dispute);
      repository.getOperatorWorkloads.mockResolvedValue([
        { operatorId: BigInt(10), activeCount: 5 },
        { operatorId: BigInt(11), activeCount: 2 }, // 가장 적음
      ]);

      const result = await service.assignOperator(disputeId, BigInt(99));

      expect(result.operatorId).toBe("11");
      expect(result.status).toBe(DisputeStatus.ASSIGNED);
      expect(repository.update).toHaveBeenCalled();
    });
  });

  describe("changeStatus", () => {
    it("분쟁 상태를 성공적으로 변경한다", async () => {
      const disputeId = "DSP-2026-0001";
      const dispute = new Dispute(
        disputeId,
        DisputeStatus.ASSIGNED,
        DisputeType.TYPO,
        "REQ-123",
        BigInt(1),
        BigInt(11),
        new Date(),
        false,
        new Date(),
        new Date(),
      );

      repository.findById.mockResolvedValue(dispute);

      const result = await service.changeStatus({
        id: disputeId,
        newStatus: DisputeStatus.IN_REVIEW,
        operatorId: BigInt(11),
        note: "Reviewing...",
        isInternal: true,
      });

      expect(result.status).toBe(DisputeStatus.IN_REVIEW);
      expect(repository.addTimelineEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          status: DisputeStatus.IN_REVIEW,
          note: "Reviewing...",
          isInternal: true,
        }),
      );
    });
  });
});
